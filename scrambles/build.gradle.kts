import configurations.Languages.attachRepositories
import configurations.Languages.configureJava
import configurations.Languages.configureCheckstyle
import configurations.Languages.configureJUnit5

import dependencies.Libraries.GWTEXPORTER
import dependencies.Libraries.JUNIT_JUPITER_API
import dependencies.Libraries.JUNIT_JUPITER_ENGINE
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

description = "A Java scrambling suite. Java applications can use this project as a library. A perfect example of this is the webscrambles package."

attachRepositories()

plugins {
    `java-library`
    checkstyle
    `maven-publish`
    kotlin("jvm")
}

configureJava()
configureCheckstyle()

dependencies {
    api(project(":svglite"))

    implementation(project(":min2phase"))
    implementation(project(":threephase"))
    implementation(project(":sq12phase"))

    implementation(kotlin("stdlib-jdk8"))

    api(GWTEXPORTER)

    testImplementation(JUNIT_JUPITER_API)
    testRuntime(JUNIT_JUPITER_ENGINE)
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = "1.8"
}

configureJUnit5()

publishing {
    publications {
        create<MavenPublication>("scrambles") {
            artifactId = "tnoodle-scrambles"

            from(components["java"])
        }
    }
}
repositories {
    mavenCentral()
}
val compileKotlin: KotlinCompile by tasks
compileKotlin.kotlinOptions {
    jvmTarget = "1.8"
}
val compileTestKotlin: KotlinCompile by tasks
compileTestKotlin.kotlinOptions {
    jvmTarget = "1.8"
}
