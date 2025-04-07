import { Component , OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-previous-prediction',
  standalone: false,
  templateUrl: './previous-prediction.component.html',
  styleUrl: './previous-prediction.component.css'
})
export class PreviousPredictionComponent implements OnInit {
  predictions: any[] = [];
  total_entries: any[] = [];
  page = 1;
  limit = 5;
  totalPages = 0
  line_chartData: any;
  line_chartOptions: any;

  pie_chartData: any;
  pie_chartOptions: any;

  bar_chartData: any;
  bar_chartOptions: any;

  polar_chartData: any;
  polar_chartOptions: any;

  max_grfx = 0
  max_grfy = 0
  max_grfz = 0;

  isdata:boolean = false;
  islogin:boolean = false;

  constructor(private http: HttpClient , private auth: AuthService) {}

  async ngOnInit() {
    this.isdata = true;
    this.line_chartData = {
      labels: ['GRF-X' , 'GRF-Y' , 'GRF-Z'],
      datasets: [
        {
          label: 'GRF-X',
          data: [],
          borderColor: '#42A5F5',
          fill: false
        },
        {
          label: 'GRF-Y',
          data: [],
          borderColor: '#66BB6A',
          fill: false
        },
        {
          label: 'GRF-Z',
          data: [],
          borderColor: '#FFA726',
          fill: false
        }
      ]
    };
    this.line_chartOptions = {
      responsive: true,
      maintainAspectRatio: false
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

    this.bar_chartData = {
      labels: ['GRF Values'],
      datasets: [
        {
          label: 'GRF-X',
          data: [this.max_grfx],
          backgroundColor: ['#42A5F5'],
        },
        {
          label: 'GRF-Y',
          data: [this.max_grfy],
          backgroundColor: '#FFA726',
        },
        {
          label: 'GRF-Z',
          data: [this.max_grfz],
          backgroundColor: '#66BB6A',
        }
      ]
    };

    this.bar_chartOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    this.polar_chartData = {
      labels: ['GRF-X' , 'GRF-Y' , 'GRF-Z'],
      datasets: [
        {
          label: 'GRF-X',
          data: [this.max_grfx , this.max_grfy , this.max_grfz],
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

    await this.loadPredictions();
    if(this.auth.isLocalStorageAvailable())
    {
      this.islogin = localStorage.getItem('islogin') == 'true'
    }
  }

  loadPredictions() {
    let uid = this.auth.isLocalStorageAvailable() ? localStorage.getItem('uid') : ''
    this.http.get<any>(`https://groundreactionforce.onrender.com/get_predictions?page=${this.page}&limit=${this.limit}&uid=${uid}`).subscribe(
      async (res)=> {
        this.predictions = await res.paginated_entries
        this.totalPages = res.total
        this.total_entries = res.entries
        this.isdata = res.entries.length === 0

        let grfx = 0 , grfy = 0 , grfz = 0 , count = this.total_entries.length
        this.total_entries.map((item) => {
          this.line_chartData.datasets[0].data.push(item.grfx)
          this.line_chartData.datasets[1].data.push(item.grfy)
          this.line_chartData.datasets[2].data.push(item.grfz)

          this.max_grfx = Math.max(this.max_grfx, item.grfx);
          this.max_grfy = Math.max(this.max_grfy, item.grfy);
          this.max_grfz = Math.max(this.max_grfz, item.grfz);

          grfx += item.grfx;
          grfy += item.grfy;
          grfz += item.grfz
        })

        this.polar_chartData.datasets[0].data = [this.max_grfx , this.max_grfy , this.max_grfz]

        this.bar_chartData.datasets[0].data = [this.max_grfx]
        this.bar_chartData.datasets[1].data = [this.max_grfy]
        this.bar_chartData.datasets[2].data = [this.max_grfz]

        this.pie_chartData.datasets[0].data = [grfx/count , grfy/count , grfz/count]
      },
      (err) => {
        this.isdata = true
        console.log(err)
      }
    )
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadPredictions();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadPredictions();
    }
  }
}
