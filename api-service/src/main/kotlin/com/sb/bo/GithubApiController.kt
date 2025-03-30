package com.sb.bo

import org.kohsuke.github.GHMyself
import org.kohsuke.github.GitHub
import org.kohsuke.github.GitHubBuilder
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@RestController
@RequestMapping("/api/github")
class GithubApiController {

    @Value("\${github.username}")
    var username: String? = ""

    @Value("\${github.password}")
    val password: String? = ""

    //    private final var gitHub: GitHub = GitHub.connectAnonymously()
    val github: GitHub =
        GitHubBuilder().withPassword(username, password).build()

    @GetMapping("/myself")
    fun myself(): ResponseEntity<GHMyself> {
        return ResponseEntity.ok(github.myself)
    }

}