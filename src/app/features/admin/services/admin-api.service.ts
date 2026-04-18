import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdminReview, AdminUser, Announcement, Category, Genre, IgdbGame,
  Paginated, Platform, Product, Survey, SurveyResults,
} from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin`;

  getGenres(params?: Record<string, string>): Observable<Paginated<Genre>> {
    return this.http.get<Paginated<Genre>>(`${this.base}/genres`, { params });
  }
  getAllGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.base}/genres`, { params: { all: '1' } });
  }
  createGenre(data: object): Observable<Genre> {
    return this.http.post<Genre>(`${this.base}/genres`, data);
  }
  updateGenre(id: number, data: object): Observable<Genre> {
    return this.http.put<Genre>(`${this.base}/genres/${id}`, data);
  }
  deleteGenre(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/genres/${id}`);
  }
  syncGenreCategories(id: number, categories: { id: number; weight: number }[]): Observable<Genre> {
    return this.http.put<Genre>(`${this.base}/genres/${id}/categories`, { categories });
  }

  getCategories(params?: Record<string, string>): Observable<Paginated<Category>> {
    return this.http.get<Paginated<Category>>(`${this.base}/categories`, { params });
  }
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories`, { params: { all: '1' } });
  }
  createCategory(data: object): Observable<Category> {
    return this.http.post<Category>(`${this.base}/categories`, data);
  }
  updateCategory(id: number, data: object): Observable<Category> {
    return this.http.put<Category>(`${this.base}/categories/${id}`, data);
  }
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/categories/${id}`);
  }

  getPlatforms(params?: Record<string, string>): Observable<Paginated<Platform>> {
    return this.http.get<Paginated<Platform>>(`${this.base}/platforms`, { params });
  }
  createPlatform(data: object): Observable<Platform> {
    return this.http.post<Platform>(`${this.base}/platforms`, data);
  }
  updatePlatform(id: number, data: object): Observable<Platform> {
    return this.http.put<Platform>(`${this.base}/platforms/${id}`, data);
  }
  deletePlatform(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/platforms/${id}`);
  }

  getProducts(params?: Record<string, string>): Observable<Paginated<Product>> {
    return this.http.get<Paginated<Product>>(`${this.base}/products`, { params });
  }
  createProduct(data: object): Observable<Product> {
    return this.http.post<Product>(`${this.base}/products`, data);
  }
  updateProduct(id: number, data: object): Observable<Product> {
    return this.http.put<Product>(`${this.base}/products/${id}`, data);
  }
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/products/${id}`);
  }

  searchIgdb(q: string): Observable<IgdbGame[]> {
    return this.http.get<IgdbGame[]>(`${this.base}/igdb/search`, { params: { q } });
  }
  importFromIgdb(igdb_id: number): Observable<Product> {
    return this.http.post<Product>(`${this.base}/igdb/import`, { igdb_id });
  }
  updatePurchaseLinks(productId: number, platforms: { platform_id: number; purchase_url: string | null }[]): Observable<Product> {
    return this.http.put<Product>(`${this.base}/products/${productId}/purchase-links`, { platforms });
  }

  getReviews(params?: Record<string, string>): Observable<Paginated<AdminReview>> {
    return this.http.get<Paginated<AdminReview>>(`${this.base}/reviews`, { params });
  }
  banReview(id: number, reason: string): Observable<AdminReview> {
    return this.http.post<AdminReview>(`${this.base}/reviews/${id}/ban`, { ban_reason: reason });
  }
  unbanReview(id: number): Observable<AdminReview> {
    return this.http.delete<AdminReview>(`${this.base}/reviews/${id}/ban`);
  }

  getUsers(params?: Record<string, string>): Observable<Paginated<AdminUser>> {
    return this.http.get<Paginated<AdminUser>>(`${this.base}/users`, { params });
  }
  banUser(id: number, reason: string): Observable<void> {
    return this.http.post<void>(`${this.base}/users/${id}/ban`, { ban_reason: reason });
  }
  unbanUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/users/${id}/ban`);
  }
  updateUserRole(id: number, role: string): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.base}/users/${id}/role`, { role });
  }
  getSurveys(): Observable<Survey[]> {
    return this.http.get<Survey[]>(`${this.base}/surveys`);
  }
  getSurvey(id: number): Observable<Survey> {
    return this.http.get<Survey>(`${this.base}/surveys/${id}`);
  }
  createSurvey(data: object): Observable<Survey> {
    return this.http.post<Survey>(`${this.base}/surveys`, data);
  }
  updateSurvey(id: number, data: object): Observable<Survey> {
    return this.http.put<Survey>(`${this.base}/surveys/${id}`, data);
  }
  deleteSurvey(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/surveys/${id}`);
  }
  getSurveyResults(id: number): Observable<SurveyResults> {
    return this.http.get<SurveyResults>(`${this.base}/surveys/${id}/results`);
  }

  getAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.base}/announcements`);
  }
  getAnnouncement(id: number): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.base}/announcements/${id}`);
  }
  createAnnouncement(data: object): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.base}/announcements`, data);
  }
  updateAnnouncement(id: number, data: object): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.base}/announcements/${id}`, data);
  }
  deleteAnnouncement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/announcements/${id}`);
  }

  grantVerified(id: number): Observable<{ badges: string[] }> {
    return this.http.post<{ badges: string[] }>(`${this.base}/users/${id}/badge/verify`, {});
  }
  revokeVerified(id: number): Observable<{ badges: string[] }> {
    return this.http.delete<{ badges: string[] }>(`${this.base}/users/${id}/badge/verify`);
  }
}
