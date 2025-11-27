// Simple script to trigger the recipe import via API
const env = process.argv[2] || 'dev';

const URLS = {
  dev: 'http://localhost:3000',
  prod: 'https://recipe-manager-zeta-topaz.vercel.app'
};

async function importRecipes() {
  if (!['dev', 'prod'].includes(env)) {
    console.error('❌ Invalid environment. Use "dev" or "prod"');
    console.error('Usage: npm run import-recipes dev');
    console.error('       npm run import-recipes prod');
    process.exit(1);
  }

  const baseUrl = URLS[env as keyof typeof URLS];
  const apiUrl = `${baseUrl}/api/import-recipes`;

  console.log('Starting recipe import...\n');
  console.log(`Environment: ${env.toUpperCase()}`);
  console.log(`Target: ${baseUrl}\n`);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Import failed:', error);
      process.exit(1);
    }

    const results = await response.json();

    // Print all details
    results.details.forEach((detail: string) => console.log(detail));

    // Print summary
    console.log('\n=== Import Summary ===');
    console.log(`Total files: ${results.total}`);
    console.log(`Imported: ${results.imported}`);
    console.log(`Skipped: ${results.skipped}`);
    console.log(`Errors: ${results.errors}`);

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    console.error(`\nMake sure the ${env} server is accessible at ${baseUrl}`);
    process.exit(1);
  }
}

importRecipes();
