import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MilvusService } from '../../../services/services';
import { RouterModule,Router } from '@angular/router';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  loadingCreate = false;
  errorCreate: string | null = null;
  messageCreate: string | null = null;
  loadingList = false;
  errorList: string | null = null;
  messageList: string | null = null;
  loadingDrop = false;
  errorDrop: string | null = null;
  messageDrop: string | null = null;
  duzina: number =0;

  // Parametri za kreiranje indeksa
  createParams = {
    fieldName: '',
    indexName: '',
    collectionName: '',
    metricType: 'L2',  // default
    indexType: 'IVF_FLAT' // default
  };

  // Parametri za listanje indeksa
  listParams = {
    collectionName: '',
    fieldName: ''
  };

  // Parametri za brisanje indeksa
  dropParams = {
    collectionName: '',
    indexName: ''
  };

  indexes: any[] = [];

  constructor(private milvusService: MilvusService,private router: Router) {}

  ngOnInit(): void {}

  // 1️⃣ Kreiranje indeksa
  onCreateIndex(): void {
    this.loadingCreate = true;
    this.errorCreate = null;
    this.messageCreate = null;

    this.milvusService.createIndex(this.createParams).subscribe({
      next: (res) => {
        this.messageCreate = '✅ Index kreiran!';
        this.loadingCreate = false;
      },
      error: (err) => {
        this.errorCreate = '❌ Greška pri kreiranju indeksa';
        console.error(err);
        this.loadingCreate = false;
      }
    });
  }

  // 2️⃣ Lista indeksa
  onListIndexes(): void {
    this.loadingList = true;
    this.errorList = null;
    this.indexes = [];

    this.milvusService.listIndexes(this.listParams).subscribe({
      next: (res) => {
        //console.log(res.index.index_descriptions[0].index_name);
        if(res.length!=0){
          this.duzina=1;
        }
        this.indexes = res.index.index_descriptions[0].index_name || [];
        this.loadingList = false;
      },
      error: (err) => {
        this.errorList = '❌ Greška pri dohvatanju liste indeksa';
        console.error(err);
        this.loadingList = false;
      }
    });
  }

  // 3️⃣ Brisanje indeksa
 onDropIndex(): void {
  if (!this.dropParams.collectionName || !this.dropParams.indexName) {
    this.errorDrop = "⚠️ Unesite naziv kolekcije i indeksa!";
    return;
  }

  this.loadingDrop = true;
  this.errorDrop = null;
  this.messageDrop = null;

  console.log(`🗑️ Brisanje indeksa: ${this.dropParams.indexName} iz kolekcije ${this.dropParams.collectionName}`);

  this.milvusService.dropIndex(this.dropParams.collectionName, this.dropParams.indexName).subscribe({
    next: (res) => {
      this.messageDrop = `✅ Indeks "${this.dropParams.indexName}" uspešno obrisan!`;
      this.loadingDrop = false;

      this.onListIndexes?.();
    },
    error: (err) => {
      this.errorDrop = '❌ Greška pri brisanju indeksa.';
      console.error(err);
      this.loadingDrop = false;
    }
  });
}
}
