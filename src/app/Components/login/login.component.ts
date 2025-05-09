import { Component , OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { FormControl, Validators } from '@angular/forms';
import Toastify from 'toastify-js';
import { Router } from '@angular/router';

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
  warning:any;

  method:any = {
    name: 'Sign in',
    button_text: 'Sign'
  }

  constructor(
    private http:HttpClient ,
    private authService: AuthService,
    private route: Router
  ){}
  ngOnInit(): void {
    // console.log(localStorage.getItem('name'))
  }
  async Login(email:any , password:any){
    this.http.post('https://groundreactionforce.onrender.com/login',{email , password}).subscribe({
      next: (response:any) => {
        if(this.authService.isLocalStorageAvailable()) {
          localStorage.setItem('name', response['name'])
          localStorage.setItem('uid' , response['uid'])
          localStorage.setItem('islogin', JSON.stringify(true))

          this.route.navigate(['/home']).then(() => {
            window.location.reload();
          });
        }
      },
      error: (error) => {
        alert('⚠️ Unable to login, Please try again')
        console.error('Login failed', error)
      }
    });
  }

  forgot(email:any){
    this.authService.sendResetPassword(email);
  }

  register(email:any , password:any , confirm_password:any){
    if(password === confirm_password){
      this.http.post('https://groundreactionforce.onrender.com/register', {email , password}).subscribe({
        next: (response:any)=> {
          this.method={
            name: 'Sign in',
            button_text: 'Sign'
          }
          if(this.authService.isLocalStorageAvailable()) {
            localStorage.setItem('name', response['name'])
            localStorage.setItem('uid' , response['uid'])
            localStorage.setItem('islogin', JSON.stringify(true))
  
            this.route.navigate(['/home']).then(() => {
              window.location.reload();
            });
          }
        },
        error: (error)=> {
          alert('⚠️ User already Exist')
        }
      })
    }
    else{
      alert('⚠️ Both passwords must be same')
    }
  }

  googleLogin() {
    this.authService.googleLogin();
  }

  githubLogin(){
    this.authService.githubLogin();
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
