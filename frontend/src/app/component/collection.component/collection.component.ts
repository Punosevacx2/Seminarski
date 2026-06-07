import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MilvusService } from '../../../services/services';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {
  loadingCreate = false;
  errorCreate: string | null = null;
  messageCreate: string | null = null;
  loadingLoad = false;
  errorLoad: string | null = null;
  messageLoad: string | null = null;
  loadingDrop = false;
  errorDrop: string | null = null;
  messageDrop: string | null = null;

  // Parametri za kreiranje kolekcije
  createParams = {
    name: ''
  };
  dropParams={
    name: ''
  };

  // Parametri za opis ili brisanje kolekcije
  collectionName: string = '';

  collections: any[] = [];
  collectionDetails: any = null;

  constructor(private milvusService: MilvusService, private router: Router) {}

  ngOnInit(): void {
    this.onListCollections(); // opcionalno: listaj sve kolekcije na startu
  }

  // 1️⃣ Kreiranje kolekcije
  onCreateCollection(): void {
    if (!this.createParams.name) {
      this.errorCreate = '⚠️ Unesite naziv kolekcije!';
      return;
    }

    this.loadingCreate = true;
    this.errorCreate = null;
    this.messageCreate = null;

    this.milvusService.createCollection(this.createParams.name).subscribe({
      next: (res) => {
        this.messageCreate = `✅ Kolekcija "${this.createParams.name}" kreirana!`;
        this.loadingCreate = false;
        this.createParams.name = '';
        this.onListCollections();
      },
      error: (err) => {
        this.errorCreate = '❌ Greška pri kreiranju kolekcije';
        console.error(err);
        this.loadingCreate = false;
      }
    });
  }

  // 2️⃣ Lista kolekcija
  onListCollections(): void {
  this.loadingLoad = true;
  this.errorLoad = null;
  this.collections = [];

  this.milvusService.listCollections().subscribe({
    next: (res) => {
      // JSON koji vraća backend ima polje 'data'
      this.collections = res.data || [];
      this.loadingLoad = false;
    },
    error: (err) => {
      this.errorLoad = '❌ Greška pri dohvatanju liste kolekcija';
      console.error(err);
      this.loadingLoad = false;
    }
  });
}

  // 3️⃣ Prikaz detalja kolekcije
  /*onDescribeCollection(name: string): void {
    if (!name) return;

    this.loading = true;
    this.error = null;
    this.collectionDetails = null;

    this.milvusService.describeCollection(name).subscribe({
      next: (res) => {
        this.collectionDetails = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = '❌ Greška pri dohvatanju detalja kolekcije';
        console.error(err);
        this.loading = false;
      }
    });
  }*/

  // 4️⃣ Brisanje kolekcije
  onDropCollection(): void {
    if (!this.dropParams.name ) {
    this.errorDrop = "⚠️ Unesite naziv kolekcije i indeksa!";
    return;
  }
    this.loadingDrop = true;
    this.errorDrop = null;
    this.messageDrop = null;

    this.milvusService.dropCollection(this.dropParams.name).subscribe({
      next: (res) => {
        this.messageDrop = `✅ Kolekcija "${this.dropParams.name}" obrisana!`;
        this.loadingDrop = false;
        this.onListCollections();
      },
      error: (err) => {
        this.errorDrop = '❌ Greška pri brisanju kolekcije';
        console.error(err);
        this.loadingDrop = false;
      }
    });
  }
}
