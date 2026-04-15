import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductCard, ProductDetail, ReviewEditFormData, ReviewFormData } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getRelevantProducts(): Observable<ProductCard[]> {
    return this.http.get<ProductCard[]>(`${this.base}/products/relevant`);
  }

  getProduct(type: string, slug: string): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${this.base}/products/${type}/${slug}`);
  }

  getReviewForm(productId: number): Observable<ReviewFormData> {
    return this.http.get<ReviewFormData>(`${this.base}/products/${productId}/review-form`);
  }

  submitReview(data: { product_id: number; body: string; scores: { category_id: number; score: number }[] }): Observable<void> {
    return this.http.post<void>(`${this.base}/reviews`, data);
  }

  getReviewEditForm(reviewId: number): Observable<ReviewEditFormData> {
    return this.http.get<ReviewEditFormData>(`${this.base}/reviews/${reviewId}/edit-form`);
  }

  updateReview(reviewId: number, data: { body: string; scores: { category_id: number; score: number }[] }): Observable<void> {
    return this.http.put<void>(`${this.base}/reviews/${reviewId}`, data);
  }
}
