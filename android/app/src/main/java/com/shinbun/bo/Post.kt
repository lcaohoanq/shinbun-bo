package com.shinbun.bo

data class PostDetail(
    val name: String,
    val path: String,
    val sha: String,
    val size: Int,
    val url: String,
    val html_url: String,
    val git_url: String,
    val download_url: String?,
    val type: String,
    val content: String? = null
)

typealias PostList = List<PostDetail>