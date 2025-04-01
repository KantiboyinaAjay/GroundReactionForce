import { Component , OnInit } from '@angular/core';
import { FormBuilder , FormControlName, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-prediction',
  standalone: false,
  templateUrl: './prediction.component.html',
  styleUrl: './prediction.component.css'
})
export class PredictionComponent implements OnInit {
  prediction_form!: FormGroup
  sessionData: any;
  output_prediction!: FormGroup
  ouput_visible:boolean = false

  constructor(
    private auth_service: AuthService,
    private fb: FormBuilder,
    private http: HttpClient
  ){}

  ngOnInit(): void {
    this.prediction_form = this.fb.group({
      a1: ['', Validators.required],
        a2: ['', Validators.required],
        a3: ['', Validators.required],
        v1: ['', Validators.required],
        v2: ['', Validators.required],
        v3: ['', Validators.required],
        uid: ['']
    })
    this.ouput_visible = false
    this.output_prediction = this.fb.group({
      grfx: [''],
      grfy: [''],
      grfz: ['']
    })
  }
  onSubmit(): void {
    if (this.prediction_form.valid) {
      if(this.auth_service.isLocalStorageAvailable())
      {
        this.prediction_form.patchValue({
          uid: localStorage.getItem('uid')
        });
      }
      this.http.post('http://127.0.0.1:5000/predict', this.prediction_form.value).subscribe({
        next: (response:any) => {
          this.output_prediction.patchValue({
            grfx: response['grfx'],
            grfy: response['grfy'],
            grfz: response['grfz']
          })
          this.ouput_visible = true;
        },
        error: (error) => console.error('error : ', error)
      })
    } else {
      console.log('Form is invalid');
    }
  }
}
