import { Injectable , OnInit } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, GithubAuthProvider } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnInit {
  constructor(private auth: Auth, private http: HttpClient) {}
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

      await this.http.post('http://127.0.0.1:8000/auth/google', { idToken }).subscribe(
        (res:any) => {
          if(this.isLocalStorageAvailable()) {
            localStorage.setItem('name', res['name'])
            localStorage.setItem('uid', res['uid'])
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

      await this.http.post('http://127.0.0.1:8000/auth/github', { idToken }).subscribe(
        (res:any) => {
          if(this.isLocalStorageAvailable()) {
            localStorage.setItem('name', res['name'])
            localStorage.setItem('uid', res['uid'])
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

  logout() {
    localStorage.clear();
    this.http.get('http://127.0.0.1:8000/logout')
  }
}