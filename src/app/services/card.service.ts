import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card } from '../models/card.model';

@Injectable({
    providedIn: 'root'
})
export class CardService {
    private apiUrl = 'http://localhost:8080/api/cards';

    constructor(private http: HttpClient) { }

    getCards(): Observable<Card[]> {
        return this.http.get<Card[]>(this.apiUrl);
    }

    getCard(id: number): Observable<Card> {
        return this.http.get<Card>(`${this.apiUrl}/${id}`);
    }

    createCard(card: Card): Observable<Card> {
        return this.http.post<Card>(this.apiUrl, card);
    }

    updateCard(id: number, card: Card): Observable<Card> {
        return this.http.put<Card>(`${this.apiUrl}/${id}`, card);
    }

    deleteCard(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
