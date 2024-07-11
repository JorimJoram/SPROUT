package com.sesac.climb_mates.config.auth

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val customSuccessHandler: CustomSuccessHandler,
    private val customFailureHandler: CustomFailureHandler
) {
    @Bean
    fun passwordEncoder():PasswordEncoder{
        return  BCryptPasswordEncoder() // 1234 ->
    }

    @Bean
    fun authenticationManager(authenticationConfiguration: AuthenticationConfiguration):AuthenticationManager{
        return authenticationConfiguration.authenticationManager
    }

    @Bean
    fun filterChain(http:HttpSecurity): SecurityFilterChain{
        http.csrf { it.disable() }
        http.authorizeHttpRequests{
            it
                .requestMatchers("/", "/script/**", "/css/**", "/img/**",
                    "/article/**", "/store/**", "/login/**", "/account/**", "/sms/**"
                ).permitAll()
        }
        http.formLogin{
            it
                .loginPage("/login")
                .loginProcessingUrl("/login/action")
                .successHandler(customSuccessHandler)
                .failureHandler(customFailureHandler)
        }
        return http.build()
    }
}