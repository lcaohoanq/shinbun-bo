package com.shinbun.bo.utils

import okhttp3.Call
import okhttp3.Callback
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import java.io.IOException


fun callApi(url: String, token: String) {
    val client = OkHttpClient()

    val request = Request.Builder()
        .url(url)
        .addHeader("Authorization", "Bearer $token") // Add Bearer token here
        .build()

    client.newCall(request).enqueue(object : Callback {
        override fun onFailure(call: Call, e: IOException) {
            println("Request failed: ${e.message}")
        }

        override fun onResponse(call: Call, response: Response) {
            response.use {
                if (!it.isSuccessful) throw IOException("Unexpected code $response")

                println("Response data: ${it.body?.string()}")
            }
        }
    })
}