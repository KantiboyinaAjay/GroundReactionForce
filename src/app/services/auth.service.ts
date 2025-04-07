import { Injectable , OnInit } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, GithubAuthProvider } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnInit {
  constructor(private auth: Auth, private http: HttpClient , private route: Router) {}
  ngOnInit(): void {
    localStorage.clear();
  }
  async googleLogin() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const idToken = await result.user.getIdToken();
      console.log('Google User:', result.user);
      console.log('ID Token:', idToken);

      await this.http.post('https://groundreactionforce.onrender.com/auth/google', { idToken }).subscribe(
        (res:any) => {
          if(this.isLocalStorageAvailable()) {
            localStorage.setItem('name', res['name'])
            localStorage.setItem('uid', res['uid'])
            localStorage.setItem('islogin', JSON.stringify(true))

            this.route.navigate(['/home']).then(() => {
              window.location.reload();
            });
          }
        },
        (err) => console.error('Error:', err)
      );
    }
    catch{}
  }

  async githubLogin() {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const idToken = await result.user.getIdToken();

      await this.http.post('https://groundreactionforce.onrender.com/auth/github', { idToken }).subscribe(
        (res:any) => {
          if(this.isLocalStorageAvailable()) {
            localStorage.setItem('name', res['name'])
            localStorage.setItem('uid', res['uid'])
            localStorage.setItem('islogin', JSON.stringify(true))

            this.route.navigate(['/home']).then(() => {
              window.location.reload();
            });
          }
        },
        (err) => console.error('Error:', err)
      );
    }
    catch{}
  }

  public isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}