import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class MilvusService {

  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}


searchFulltext(body: {
    text: string;}){
 return this.http.post(`${this.baseUrl}/fulltext`, body);
}

searchHybrid(body: {
    text: string;
    topK?: number;
    collectionName?: string;
    metricType?: string;
    indexParams?: any;
    filter?: string;}){
 return this.http.post(`${this.baseUrl}/hybrid`, body);
}


  // 🏗️ 1. Kreiraj kolekciju
  createCollection(name: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/collection`, { name });
  }

  // 📥 2. Ubaci vektor
  insertVector(data: { title: string; description: string; collectionName:string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/insert`, data);
  }

  // 🔍 3. Semantička pretraga
  searchSemantic(body: {
    text: string;
    topK?: number;
    collectionName?: string;
    metricType?: string;
    indexParams?: any;
  }): Observable<any> {
    console.log(body);
    return this.http.post(`${this.baseUrl}/semantic`, body);
  }

  // ⚡ 4. Hibridna pretraga
  searchVectorsHybrid(body: {
    text: string;
    topK?: number;
    collectionName: string;
    metricType?: string;
    indexParams?: any;
    filter?: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/hybrid-search`, body);
  }

  // 🧮 5. Query filter
  queryFilter(body: { collectionName: string; filter?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/query`, body);
  }

  // 🗑️ 6. Brisanje vektora po ID-u
  deleteVector(id: number, collectionName:string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${collectionName}/${id}`);
  }

  // 🧱 7. Kreiraj indeks
  createIndex(body: {
    fieldName: string;
    indexName: string;
    collectionName: string;
    metricType?: string;
    indexType?: string;
  }): Observable<any> {
    console.log(body);
    return this.http.post(`${this.baseUrl}/index`, body);
  }

  // 📋 8. Lista indeksa
  listIndexes(body: { collectionName: string; fieldName: string }): Observable<any> {
    const res=this.http.post(`${this.baseUrl}/indexes`, body);
    console.log(res);
    return res;
  }

  // 🗑️ 9. Brisanje indeksa
  dropIndex( collectionName: string, indexName: string ): Observable<any> {
    return this.http.delete(`${this.baseUrl}/index/${collectionName}/${indexName}`);
  }

  // 📚 10. Lista kolekcija
  listCollections(): Observable<any> {
    return this.http.get(`${this.baseUrl}/collections`);
  }

  // 🔍 11. Detalji kolekcije
  describeCollection(name: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/collection/${name}`);
  }

  // 🗑️ 12. Brisanje kolekcije
  dropCollection(name: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/collection/${name}`);
  }

searchById(id: string, collectionName: String): Observable<any> {
  const body = {
    id,
    collectionName
  };
  return this.http.post(`${this.baseUrl}/getById`, body);
}


}
