import { Component , OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { FormControl, Validators } from '@angular/forms';
import Toastify from 'toastify-js';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required, Validators.minLength(6)]);
  confirm_password = new FormControl('' , [Validators.required , Validators.minLength(6)]);
  icon:string = 'assets/hide.svg';
  confirm_icon:string = 'assets/hide.svg'
  show_password_icon:boolean = false;
  confirm_show_password_icon:boolean = false;

  method:any = {
    name: 'Sign in',
    button_text: 'Sign'
  }

  constructor(
    private http:HttpClient ,
    private authService: AuthService
  ){}
  ngOnInit(): void {
  }
  Login(email:any , password:any){
    this.http.post('http://127.0.0.1:5000/login',{email , password}).subscribe({
      next: (response) => console.log('Login successful', response),
      error: (error) => console.error('Login failed', error)
    });
  }

  forgot(email:any){
    this.http.post('http://127.0.0.1:5000/forgot', {email}).subscribe({
      next: (response)=> {
        this.method={
          name: 'Sign in',
          button_text: 'Sign'
        }
        Toastify({
          text: "✅ Reset mail sent sucessfully.",
          duration: 5000,
          close: true,
          gravity: "top",
          position: "center",
          style: {
            background: "rgb(235, 252, 236)",
            color: "black",
            "height": "30px",
            "max-width": "300px",
            "text-align": "center",
            "border-radius": " 8px",
            "margin": "auto",
            "margin-top": "5px",
            "left": "50%",
            "transform": "translateX(-50%)"
          }
        }).showToast();
      },
      error: (error)=> console.log(error)
    })
  }

  register(email:any , password:any , confirm_password:any){
    if(password === confirm_password){
      this.http.post('http://127.0.0.1:5000/register', {email , password}).subscribe({
        next: (response)=> {
          Toastify({
            text: "✅ sucessfully Registered.",
            duration: 5000,
            close: true,
            gravity: "top",
            position: "center",
            style: {
              background: "rgb(235, 252, 236)",
              color: "black",
              "height": "30px",
              "max-width": "300px",
              "text-align": "center",
              "border-radius": " 8px",
              "margin": "auto",
              "margin-top": "5px",
              "left": "50%",
              "transform": "translateX(-50%)"
            }
          }).showToast();
          this.method={
            name: 'Sign in',
            button_text: 'Sign'
          }
        },
        error: (error)=> {
          Toastify({
            text: "⚠️ User already exists.",
            duration: 5000,
            close: true,
            gravity: "top",
            position: "center",
            style:{
              background: "rgb(252, 235, 235)",
              color: "black",
              "height": "30px",
              "max-width": "300px",
              "text-align": "center",
              "border-radius": " 8px",
              "margin": "auto",
              "margin-top": "5px",
              "left": "50%",
              "transform": "translateX(-50%)"
            }
          }).showToast();
        }
      })
    }
    else{
      Toastify({
        text: "⚠️ Both passwords must be equal.",
        duration: 5000,
        close: true,
        gravity: "top",
        position: "center",
        style:{
          background: "rgb(252, 235, 235)",
          color: "black",
          "height": "30px",
          "max-width": "300px",
          "text-align": "center",
          "border-radius": " 8px",
          "margin": "auto",
          "margin-top": "5px",
          "left": "50%",
          "transform": "translateX(-50%)"
        }
      }).showToast();
    }
  }

  googleLogin() {
    this.authService.googleLogin();
  }

  githubLogin(){
    this.authService.githubLogin();
  }

  logout(){
    alert("clcick")
    this.authService.logout();
  }

  sign(){
    this.method = {
      name: 'Sign in',
      button_text: 'Sign'
    }
  }

  signup(){
    this.method = {
      name: 'Sign up',
      button_text: 'Create a new account'
    }
  }

  Remember(){
    this.method = {
      name: 'Forgot',
      button_text: 'Reset my password'
    }
  }

  show(){
    this.show_password_icon = !this.show_password_icon;   
    if(this.show_password_icon) this.icon = 'assets/show.svg';
    else this.icon = 'assets/hide.svg'
  }

  confirm_show(){
    this.confirm_show_password_icon = !this.confirm_show_password_icon;   
    if(this.confirm_show_password_icon) this.confirm_icon = 'assets/show.svg';
    else this.confirm_icon = 'assets/hide.svg'
  }
}
