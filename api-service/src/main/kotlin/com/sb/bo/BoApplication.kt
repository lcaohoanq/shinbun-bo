package com.sb.bo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class BoApplication

fun main(args: Array<String>) {
	runApplication<BoApplication>(*args)
	WebUtil.openHomePage()
}
