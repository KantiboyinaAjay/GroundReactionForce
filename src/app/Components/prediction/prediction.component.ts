import { Component , OnInit } from '@angular/core';
import { FormBuilder , FormGroup, Validators } from '@angular/forms';
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
  feedback:any = []
  injuries:any = []

  constructor(
    private auth_service: AuthService,
    private fb: FormBuilder,
    private http: HttpClient
  ){}

  line_chartData: any;
  line_chartOptions: any;

  pie_chartData: any;
  pie_chartOptions:any;

  polar_chartData: any;
  polar_chartOptions: any;

  islogin:boolean = false;

  ngOnInit(): void {
    if(this.auth_service.isLocalStorageAvailable())
    {
      this.islogin = localStorage.getItem('islogin') == 'true'
    }

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

    this.line_chartData = {
      labels: ['GRF-X' , 'GRF-Y' , 'GRF-Z'],
      datasets: [
        {
          label: '',
          data: [0, 0, 0],
          borderColor: '#42A5F5',
          fill: false
        }
      ]
    };

    this.pie_chartData = {
      labels: ['GRF-X' , 'GRF-Y' , 'GRF-Z'],
      datasets: [
        {
          data: [0 , 0 , 0],
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
          hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D']
        }
      ]
    };

    this.line_chartOptions = {
      responsive: true,
      maintainAspectRatio: false
    };

    this.pie_chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      }
    }

    this.polar_chartData = {
      labels: ['GRF-X' , 'GRF-Y' , 'GRF-Z'],
      datasets: [
        {
          label: 'GRF',
          data: [0 , 0 , 0],
          backgroundColor: ['#42A5F5' , '#FFA726' , '#66BB6A'],
        },
      ]
    };

    this.polar_chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      }
    };
  }
  onSubmit(): void {
    if (this.prediction_form.valid) {
      if(this.auth_service.isLocalStorageAvailable())
      {
        this.prediction_form.patchValue({
          uid: localStorage.getItem('uid')
        });
      }
      this.http.post('http://127.0.0.1:8000/predict', this.prediction_form.value).subscribe({
        next: (response:any) => {
          this.output_prediction.patchValue({
            grfx: response['grfx'].toFixed(2),
            grfy: response['grfy'].toFixed(2),
            grfz: response['grfz'].toFixed(2)
          })

          this.feedback = response['feedback']
          this.injuries = response['injuries']

          this.line_chartData.datasets[0].data = [response['grfx'].toFixed(2) , response['grfy'].toFixed(2) , response['grfz'].toFixed(2)]
          this.pie_chartData.datasets[0].data = [response['grfx'].toFixed(2) , response['grfy'].toFixed(2) , response['grfz'].toFixed(2)]
          this.polar_chartData.datasets[0].data = [response['grfx'].toFixed(2) , response['grfy'].toFixed(2) , response['grfz'].toFixed(2)]
          this.ouput_visible = true;
        },
        error: (error) => console.error('error : ', error)
      })
    } else {
      console.log('Form is invalid');
    }
  }
}
