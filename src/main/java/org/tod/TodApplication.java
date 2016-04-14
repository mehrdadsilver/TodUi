package org.tod;

import java.io.IOException;
import java.security.Principal;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.util.WebUtils;
import org.tod.domain.User;
import org.tod.service.CurrentUser;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

@SpringBootApplication
@RestController
@EnableRedisHttpSession
@EnableZuulProxy
public class TodApplication {

	
	@RequestMapping("/user")
	  public User user(Authentication authentication) {
	
		CurrentUser currentUser = (CurrentUser) authentication.getPrincipal();
	    return currentUser.getUser();
	  }
	
	@RequestMapping(value = "/register", method= RequestMethod.GET)
	public ModelAndView register()
	{
				
		return  new ModelAndView("signup.html");
		
	}
	
    public static void main(String[] args) {
        SpringApplication.run(TodApplication.class, args);
    }
    
    @Configuration
	@EnableGlobalMethodSecurity(prePostEnabled = true)
    @Order(SecurityProperties.ACCESS_OVERRIDE_ORDER)
    protected static class SecurityConfiguration extends WebSecurityConfigurerAdapter {
      

	@Override
      protected void configure(HttpSecurity http) throws Exception {
    	  http
			.httpBasic().and()
			.authorizeRequests()
				.antMatchers("/index.html", "/","/signup.html").permitAll()
				.anyRequest().hasAnyAuthority("ADMIN","USER");
		// @formatter:on
      }
      
//      @Override
//	    public void configure(AuthenticationManagerBuilder auth) throws Exception {
//	        
//			System.out.println("*****************************");
//			auth.userDetailsService(userDetailsService)
//	                .passwordEncoder(new BCryptPasswordEncoder());
//	    }
    }
    
}
