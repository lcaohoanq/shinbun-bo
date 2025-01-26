package com.shinbun.bo

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize views
        val usernameEditText = findViewById<EditText>(R.id.usernameEditText)
        val passwordEditText = findViewById<EditText>(R.id.passwordEditText)
        val loginButton = findViewById<Button>(R.id.loginButton)

        // Set onClickListener for login button
        loginButton.setOnClickListener {
            val username = usernameEditText.text.toString()
            val password = passwordEditText.text.toString()

            // Check if the username and password are "admin"
            if (username == "admin" && password == "admin") {
                // Login success, navigate to another activity or show a success message
                Toast.makeText(this, "Login Successful!", Toast.LENGTH_SHORT).show()

                // Optionally, you can start a new activity
                val intent = Intent(this, DashboardActivity::class.java)
                startActivity(intent)
            } else {
                // Login failed, show error message
                Toast.makeText(this, "Invalid credentials. Try again.", Toast.LENGTH_SHORT).show()
            }
        }
    }
}