package com.shinbun.bo

data class PostDetail(
    private val name: String,
    private val path: String,
    private val sha: String,
    private val size: Int,
    private val url: String,
    private val htmlUrl: String,
    private val gitUrl: String,
    private val downloadUrl: String,
    private val type: String,
    private val links: Links
)


data class Links(
    private val self: String,
    private val git: String,
    private val html: String
)

data class PostContent(
    private val content: String,
    private val downLoadUrl: String,
    private val encoding: String,
    private val gitUrl: String,
    private val htmlUrl: String,
    private val name: String,
    private val path: String,
    private val sha: String,
    private val size: Int,
    private val type: String,
    private val url: String,
)