#!/usr/bin/env bash
# Creates a new, isolated deployment. Run after signing into your own Azure and GitHub accounts.
set +x
set -euo pipefail

: "${AZURE_SUBSCRIPTION_ID:?Set your Azure for Students subscription ID}"
: "${AZURE_LOCATION:?Set a region permitted by your subscription}"
: "${AZURE_STATIC_LOCATION:?Set a supported Static Web Apps region (for example westeurope)}"

repo='LethaboDev/finance-tracker'
resource_group='finance-tracker-lethabodev'
for required_tool in az gh openssl python3; do
  command -v "$required_tool" >/dev/null || { echo "Install $required_tool first" >&2; exit 1; }
done
[[ "$(gh api user --jq '.login' | tr '[:upper:]' '[:lower:]')" == lethabodev ]] || {
  echo 'Sign in to GitHub as LethaboDev first' >&2; exit 1;
}
gh repo view "$repo" --json name >/dev/null
az account set --subscription "$AZURE_SUBSCRIPTION_ID"
az account show --query '{subscription:name,id:id,account:user.name}' --output table
[[ "$(az account show --query name -o tsv)" == 'Azure for Students' ]] || {
  echo 'Select your Azure for Students subscription; do not use another paid subscription.' >&2; exit 1;
}
[[ "$(az group exists --name "$resource_group")" == false ]] || {
  echo 'Resource group already exists. Inspect existing resources; this script only creates a fresh deployment.' >&2; exit 1;
}

suffix="$(openssl rand -hex 4)"
webapp="ft-lethabodev-$suffix"
postgres="ft-lethabodev-pg-$suffix"
staticapp="ft-lethabodev-ui-$suffix"
plan="ft-lethabodev-free-$suffix"
export FT_DB_PASSWORD="Aa1!$(openssl rand -hex 24)"
export FT_JWT_SECRET="$(openssl rand -base64 64 | tr -d '\n')"
secret_file="$(mktemp)"
federation_file="$(mktemp)"
chmod 600 "$secret_file" "$federation_file"
trap 'rm -f "$secret_file" "$federation_file"; unset FT_DB_PASSWORD FT_JWT_SECRET' EXIT

for provider in Microsoft.Web Microsoft.DBforPostgreSQL; do
  az provider register --namespace "$provider" --wait --output none
done
az group create --name "$resource_group" --location "$AZURE_LOCATION" \
  --tags owner=LethaboDev application=finance-tracker --output none
az appservice plan create --name "$plan" --resource-group "$resource_group" \
  --location "$AZURE_LOCATION" --is-linux --sku F1 --output none
az webapp create --name "$webapp" --resource-group "$resource_group" \
  --plan "$plan" --runtime 'JAVA:21-java21' --basic-auth Disabled --output none
az webapp update --name "$webapp" --resource-group "$resource_group" \
  --https-only true --output none
az staticwebapp create --name "$staticapp" --resource-group "$resource_group" \
  --location "$AZURE_STATIC_LOCATION" --sku Free --output none
frontend_host="$(az staticwebapp show --name "$staticapp" --resource-group "$resource_group" --query defaultHostname -o tsv)"
backend_host="$(az webapp show --name "$webapp" --resource-group "$resource_group" --query defaultHostName -o tsv)"

# No fallback to a larger paid plan if the small SKU or chosen region is unavailable.
az postgres flexible-server create --name "$postgres" --resource-group "$resource_group" \
  --location "$AZURE_LOCATION" --admin-user ftadmin --admin-password "$FT_DB_PASSWORD" \
  --tier Burstable --sku-name Standard_B1ms --storage-size 32 --version 16 \
  --backup-retention 7 --zonal-resiliency Disabled --geo-redundant-backup Disabled \
  --storage-auto-grow Disabled --public-access None --yes --output none
az postgres flexible-server db create --resource-group "$resource_group" \
  --server-name "$postgres" --database-name finance_tracker --output none
postgres_host="$(az postgres flexible-server show --name "$postgres" --resource-group "$resource_group" --query fullyQualifiedDomainName -o tsv)"

# Allow only the possible outbound addresses of this App Service, not all Azure services.
outbound_ips="$(az webapp show --name "$webapp" --resource-group "$resource_group" --query possibleOutboundIpAddresses -o tsv)"
[[ -n "$outbound_ips" ]] || { echo 'No backend outbound addresses found; inspect App Service networking.' >&2; exit 1; }
IFS=',' read -ra addresses <<< "$outbound_ips"
for index in "${!addresses[@]}"; do
  az postgres flexible-server firewall-rule create --resource-group "$resource_group" \
    --name "$postgres" --rule-name "backend-$index" \
    --start-ip-address "${addresses[$index]}" --end-ip-address "${addresses[$index]}" --output none
done
export FT_DB_HOST="$postgres_host" FT_FRONTEND_ORIGIN="https://$frontend_host"
python3 - "$secret_file" <<'PY'
import json, os, sys
with open(sys.argv[1], 'w') as handle:
    json.dump({
        'DB_URL': 'jdbc:postgresql://' + os.environ['FT_DB_HOST'] + ':5432/finance_tracker?sslmode=verify-full&sslfactory=org.postgresql.ssl.DefaultJavaSSLFactory',
        'DB_USERNAME': 'ftadmin',
        'DB_PASSWORD': os.environ['FT_DB_PASSWORD'],
        'JWT_SECRET': os.environ['FT_JWT_SECRET'],
        'FRONTEND_ORIGINS': os.environ['FT_FRONTEND_ORIGIN'],
        'PORT': '80',
        'JAVA_OPTS': '-XX:MaxRAMPercentage=60.0',
    }, handle)
PY
az webapp config appsettings set --name "$webapp" --resource-group "$resource_group" \
  --settings "@$secret_file" --output none

# GitHub uses short-lived OIDC credentials scoped to this backend only.
client_id="$(az ad app create --display-name "$webapp-github" --query appId -o tsv)"
principal_id="$(az ad sp create --id "$client_id" --query id -o tsv)"
webapp_id="$(az webapp show --name "$webapp" --resource-group "$resource_group" --query id -o tsv)"
az role assignment create --assignee-object-id "$principal_id" --assignee-principal-type ServicePrincipal \
  --role 'Website Contributor' --scope "$webapp_id" --output none
python3 - "$federation_file" <<'PY'
import json, sys
with open(sys.argv[1], 'w') as handle:
    json.dump({
        'name': 'finance-tracker-github',
        'issuer': 'https://token.actions.githubusercontent.com',
        'subject': 'repo:LethaboDev/finance-tracker:environment:azure',
        'audiences': ['api://AzureADTokenExchange'],
    }, handle)
PY
az ad app federated-credential create --id "$client_id" --parameters "@$federation_file" --output none
# Keep deployments disabled until every variable and secret has been configured.
gh api --method PUT "repos/$repo/environments/azure" >/dev/null
gh api --method PUT "repos/$repo/environments/azure" \
  --input - >/dev/null <<'JSON'
{"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}
JSON
gh api --method POST "repos/$repo/environments/azure/deployment-branch-policies" \
  -f name=main -f type=branch >/dev/null
gh variable set AZURE_CLIENT_ID --repo "$repo" --body "$client_id"
gh variable set AZURE_TENANT_ID --repo "$repo" --body "$(az account show --query tenantId -o tsv)"
gh variable set AZURE_SUBSCRIPTION_ID --repo "$repo" --body "$AZURE_SUBSCRIPTION_ID"
gh variable set AZURE_WEBAPP_NAME --repo "$repo" --body "$webapp"
gh variable set NEXT_PUBLIC_API_URL --repo "$repo" --body "https://$backend_host"
az staticwebapp secrets list --name "$staticapp" --resource-group "$resource_group" \
  --query properties.apiKey -o tsv | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --repo "$repo" --env azure

echo "Resources created in $resource_group"
echo "Backend: https://$backend_host"
echo "Frontend: https://$frontend_host"
gh variable set AZURE_DEPLOY_ENABLED --repo "$repo" --body true
gh workflow run deploy.yml --repo "$repo" --ref main
echo 'Azure deployment started. Check progress in the repository Actions tab.'
