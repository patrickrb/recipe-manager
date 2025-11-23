// Simple script to trigger the recipe import via API
async function importRecipes() {
  console.log('Starting recipe import...\n');
  console.log('Make sure your dev server is running on http://localhost:3000\n');

  try {
    const response = await fetch('http://localhost:3000/api/import-recipes', {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Import failed:', error);
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
    console.error('Error:', error instanceof Error ? error.message : error);
    console.error('\nMake sure the dev server is running: npm run dev');
    process.exit(1);
  }
}

importRecipes();
