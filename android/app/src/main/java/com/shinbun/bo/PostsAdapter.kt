package com.shinbun.bo

import android.content.Intent
import android.net.Uri
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.button.MaterialButton

class PostsAdapter(
    private val posts: MutableList<PostDetail> = mutableListOf(),
    private val onEditClick: (PostDetail) -> Unit,
    private val onDeleteClick: (PostDetail) -> Unit
) : RecyclerView.Adapter<PostsAdapter.PostViewHolder>() {

    class PostViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvPostName: TextView = view.findViewById(R.id.tvPostName)
        val btnView: MaterialButton = view.findViewById(R.id.btnView)
        val btnEdit: MaterialButton = view.findViewById(R.id.btnEdit)
        val btnDelete: MaterialButton = view.findViewById(R.id.btnDelete)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PostViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_post, parent, false)
        return PostViewHolder(view)
    }

    override fun onBindViewHolder(holder: PostViewHolder, position: Int) {
        val post = posts[position]
        holder.tvPostName.text = post.name

        if (post.name.endsWith(".md")) {
            holder.btnView.visibility = View.VISIBLE
            holder.btnEdit.visibility = View.VISIBLE
            holder.btnView.setOnClickListener {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(
                    "https://shinbun.vercel.app/posts/${post.name.removeSuffix(".md")}"
                ))
                holder.itemView.context.startActivity(intent)
            }
            holder.btnEdit.setOnClickListener { onEditClick(post) }
        } else {
            holder.btnView.visibility = View.GONE
            holder.btnEdit.visibility = View.GONE
        }

        holder.btnDelete.setOnClickListener { onDeleteClick(post) }

        holder.tvPostName.setOnClickListener {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(post.html_url))
            holder.itemView.context.startActivity(intent)
        }
    }

    override fun getItemCount() = posts.size

    fun updatePosts(newPosts: List<PostDetail>) {
        posts.clear()
        posts.addAll(newPosts)
        notifyDataSetChanged()
    }

    fun removePost(post: PostDetail) {
        val position = posts.indexOfFirst { it.sha == post.sha }
        if (position != -1) {
            posts.removeAt(position)
            notifyItemRemoved(position)
        }
    }
}