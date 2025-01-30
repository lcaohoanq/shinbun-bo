package com.shinbun.bo

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import okhttp3.*
import java.io.IOException
import android.widget.TextView
import android.widget.ProgressBar

class DashboardActivity : AppCompatActivity() {
    private lateinit var rvPosts: RecyclerView
    private lateinit var tvTotalPosts: TextView
    private lateinit var tvPostManagement: TextView
    private lateinit var progressBar: ProgressBar
    private lateinit var adapter: PostsAdapter
    private val client = OkHttpClient()
    private val gson = Gson()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        setupViews()
        fetchPosts()
    }

    private fun setupViews() {
        rvPosts = findViewById(R.id.rvPosts)
        tvTotalPosts = findViewById(R.id.tvTotalPosts)
        tvPostManagement = findViewById(R.id.tvPostManagement)
        progressBar = findViewById(R.id.progressBar)

        adapter = PostsAdapter(
            onEditClick = { post -> handleEditPost(post) },
            onDeleteClick = { post -> showDeleteConfirmation(post) }
        )

        rvPosts.layoutManager = LinearLayoutManager(this)
        rvPosts.adapter = adapter
    }

    private fun fetchPosts() {
        progressBar.visibility = View.VISIBLE

        val request = Request.Builder()
            .url("https://api.github.com/repos/lcaohoanq/shinbun/contents/src/content/posts")
            .addHeader("Authorization", "Bearer ${BuildConfig.GITHUB_TOKEN}")
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    progressBar.visibility = View.GONE
                    Toast.makeText(this@DashboardActivity,
                        "Failed to fetch posts: ${e.message}",
                        Toast.LENGTH_LONG).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    val body = it.body?.string()
                    runOnUiThread {
                        progressBar.visibility = View.GONE
                        if (it.isSuccessful && body != null) {
                            val type = object : TypeToken<List<PostDetail>>() {}.type
                            val posts: List<PostDetail> = gson.fromJson(body, type)
                            adapter.updatePosts(posts)
                            tvTotalPosts.text = "Total: ${posts.size} posts"
                        } else {
                            Toast.makeText(this@DashboardActivity,
                                "Failed to fetch posts: ${response.message}",
                                Toast.LENGTH_LONG).show()
                        }
                    }
                }
            }
        })
    }

    private fun handleEditPost(post: PostDetail) {
        val request = Request.Builder()
            .url("https://raw.githubusercontent.com/lcaohoanq/shinbun/main/src/content/posts/${post.name}")
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@DashboardActivity,
                        "Failed to fetch post content: ${e.message}",
                        Toast.LENGTH_LONG).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    if (it.isSuccessful) {
                        val content = it.body?.string()
                        // Handle edit functionality - you can start a new activity here
                        // with the content
                    }
                }
            }
        })
    }

    private fun showDeleteConfirmation(post: PostDetail) {
        AlertDialog.Builder(this)
            .setTitle("Confirm Deletion")
            .setMessage("Are you sure you want to delete the post \"${post.name}\"?")
            .setPositiveButton("Delete") { _, _ -> handleDeletePost(post) }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun handleDeletePost(post: PostDetail) {
        val requestBody = FormBody.Builder()
            .add("message", "Deleting post ${post.name.removeSuffix(".md")}")
            .add("sha", post.sha)
            .build()

        val request = Request.Builder()
            .url("https://api.github.com/repos/lcaohoanq/shinbun/contents/src/content/posts/${post.name}")
            .addHeader("Authorization", "Bearer ${BuildConfig.GITHUB_TOKEN}")
            .delete(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@DashboardActivity,
                        "Failed to delete post: ${e.message}",
                        Toast.LENGTH_LONG).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    if (response.isSuccessful) {
                        adapter.removePost(post)
                        Toast.makeText(this@DashboardActivity,
                            "Post deleted successfully",
                            Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this@DashboardActivity,
                            "Failed to delete post: ${response.message}",
                            Toast.LENGTH_LONG).show()
                    }
                }
            }
        })
    }
}