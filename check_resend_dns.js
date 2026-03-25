
const fs = require('fs');
const RESEND_API_KEY = "re_RVFvFuHq_44ysyTWwSspV929wYRhJW2Uz";
const DOMAIN_ID = "2e066f8e-ab93-4239-8c50-7fb4bd9bd315";

async function checkDomainDetails() {
  try {
    const response = await fetch(`https://api.resend.com/domains/${DOMAIN_ID}`, {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    fs.writeFileSync('dns_full_results.json', JSON.stringify(data, null, 2));
    console.log("Success: Results written to dns_full_results.json");
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDomainDetails();
