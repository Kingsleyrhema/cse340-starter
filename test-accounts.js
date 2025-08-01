// Test script to help register the required accounts
// Run this with: node test-accounts.js

const bcrypt = require("bcryptjs")
const pool = require("./database/")

async function createTestAccounts() {
  const accounts = [
    {
      firstname: "Basic",
      lastname: "Client", 
      email: "basic@340.edu",
      password: "I@mABas1cCl!3nt",
      type: "Client"
    },
    {
      firstname: "Happy",
      lastname: "Employee",
      email: "happy@340.edu", 
      password: "I@mAnEmpl0y33",
      type: "Employee"
    },
    {
      firstname: "Manager",
      lastname: "User",
      email: "manager@340.edu",
      password: "I@mAnAdm!n1strat0r", 
      type: "Admin"
    }
  ]

  for (const account of accounts) {
    try {
      const hashedPassword = await bcrypt.hashSync(account.password, 10)
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, $5) RETURNING *"
      const result = await pool.query(sql, [account.firstname, account.lastname, account.email, hashedPassword, account.type])
      console.log(`✅ Created account: ${account.firstname} ${account.lastname} (${account.email}) - Type: ${account.type}`)
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        console.log(`⚠️  Account already exists: ${account.email}`)
      } else {
        console.log(`❌ Error creating account ${account.email}:`, error.message)
      }
    }
  }
  
  console.log("\n🎉 Test accounts setup complete!")
  console.log("\n📝 Account Details:")
  console.log("1. Basic Client - basic@340.edu - I@mABas1cCl!3nt")
  console.log("2. Happy Employee - happy@340.edu - I@mAnEmpl0y33") 
  console.log("3. Manager User - manager@340.edu - I@mAnAdm!n1strat0r")
  console.log("\n🔗 Test URLs:")
  console.log("- Login: http://localhost:5500/account/login")
  console.log("- Account Management: http://localhost:5500/account/")
  console.log("- Try accessing account management without login to test authorization")
  
  process.exit(0)
}

createTestAccounts().catch(console.error) 