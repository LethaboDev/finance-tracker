# Azure deployment for LethaboDev

The independent repository is intended to be `LethaboDev/finance-tracker`, owned by your account, with a fresh `main` branch. Commit identity: `LethaboDev <lethabomaredi30@gmail.com>`.

## Resources

| Resource | Configuration |
| --- | --- |
| Resource group | `finance-tracker-lethabodev`, newly created in your subscription |
| Frontend | Azure Storage static website, StorageV2 / Standard LRS, in the backend region |
| Backend | Azure App Service, Linux F1 Free plan, Java SE 21 running Java 17 bytecode |
| Database | New PostgreSQL Flexible Server, version 16, Burstable B1ms, 32 GiB storage, 7-day local backup, no HA or storage autogrow |
| Deployment identity | GitHub OIDC, Website Contributor on this backend; Storage Blob Data Contributor on this dedicated frontend storage account |

Azure for Students offers $100 credit usable within 12 months. This subscription allows South Africa North but none of the Static Web Apps regions, so the frontend uses Azure Storage in South Africa North. Static website hosting has no hosting fee; storage and operations may consume small amounts of credit. Confirm your subscription is active and check its PostgreSQL free allowance before provisioning. The database and backup storage can consume credit if they are outside your allowance. F1 has daily compute quotas and can sleep; it is suitable for a personal student project, with no always-on guarantee. No automatic upgrade to paid hosting is configured.

## Sign in and provision

Install [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) and [GitHub CLI](https://cli.github.com/). In your own accounts, run:

```sh
az login
az account list --output table
gh auth login
```

Create an empty standalone repository in your account (not a fork). After the local fresh history has been initialized:

```sh
gh repo create LethaboDev/finance-tracker --private
# origin should be https://github.com/LethaboDev/finance-tracker.git
git push -u origin main
```

Use an Azure region allowed by your student subscription. South Africa North has been confirmed as allowed for this subscription.

```sh
export AZURE_SUBSCRIPTION_ID='YOUR-STUDENT-SUBSCRIPTION-ID'
export AZURE_LOCATION='southafricanorth'
bash scripts/provision-azure.sh
```

The script verifies the GitHub login is LethaboDev and the selected Azure subscription is named Azure for Students. It refuses to reuse an existing resource group. It creates new passwords and a new JWT secret, stores them in App Service settings, and never copies data or credentials from the original deployment. PostgreSQL requires verified TLS and only permits the backend's possible outbound IP addresses. If you change the App Service plan, refresh these firewall rules.

The script configures GitHub variables. Both deployment jobs use OIDC; no storage account keys or long-lived deployment tokens are stored in GitHub. The Azure identity only trusts workflows from this repository’s `main` branch, and deployment jobs also check that branch. The setup works with a private repository on GitHub Free without paid environment features. An Entra app registration is required for OIDC; your tenant must allow you to create it and assign the scoped role.

Before provisioning, check resource estimates and PostgreSQL allowance in your subscription and add a credit budget alert in Azure Cost Management. A budget alert sends notifications; it does not stop resources. Once all configuration succeeds, the script enables deployment and starts the GitHub workflow automatically.

GitHub Actions tests and packages the API, deploys its JAR to App Service, builds the frontend with the new API URL, and uploads the static export to the dedicated storage account’s `$web` container.

## Validate ownership and behavior

Check that the new repository has only your commit identity, no fork relationship, and no other collaborators or deploy keys. Check the new Azure resource group's IAM assignments and inherited access; new resources do not eliminate access inherited from a shared subscription. Use a subscription owned by your own account.

Open the generated frontend URL, register your own account, sign in, and add/remove a transaction. Browser network requests should target your generated Azure backend host. A newly provisioned database contains no former users or administrators. Ordinary registration creates a USER role; promote only your own account through your new database if you need ADMIN access.

If provisioning fails after creating resources, inspect `finance-tracker-lethabodev` before retrying. The script leaves resources in place and does not delete databases or overwrite an existing deployment. Database charges may continue while deployment is incomplete. Generated credentials are retained in App Service once its settings are configured; if creation failed before that step, reset the database administrator password in Azure before resuming.

## References

- [Azure for Students](https://azure.microsoft.com/free/students/)
- [App Service Linux pricing](https://azure.microsoft.com/pricing/details/app-service/linux/)
- [Azure Storage static website hosting](https://learn.microsoft.com/azure/storage/blobs/storage-blob-static-website)
- [Java App Service deployment](https://learn.microsoft.com/azure/app-service/configure-language-java-deploy-run?pivots=platform-linux)
- [PostgreSQL provisioning](https://learn.microsoft.com/azure/postgresql/configure-maintain/quickstart-create-server)
