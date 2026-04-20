import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse, ProductCard, ProductDetail, ProductReview, ReviewEditFormData, ReviewFormData, UserReviewCard } from '../models/product.model';
import { ActiveAnnouncement, ActiveSurvey, BadgesProgress, FollowersResponse, SocialLinks, UserCardData, UserConsents, UserProfile, VerificationRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getGames(search: string, page: number): Observable<PaginatedResponse<ProductCard>> {
    const params: Record<string, string | number> = { page };
    if (search) params['search'] = search;
    return this.http.get<PaginatedResponse<ProductCard>>(`${this.base}/games`, { params });
  }

  getRelevantProducts(): Observable<ProductCard[]> {
    return this.http.get<ProductCard[]>(`${this.base}/products/relevant`);
  }

  getProduct(type: string, slug: string): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${this.base}/products/${type}/${slug}`);
  }

  getProductReviews(productId: number, page: number): Observable<PaginatedResponse<ProductReview>> {
    return this.http.get<PaginatedResponse<ProductReview>>(`${this.base}/products/${productId}/reviews`, { params: { page } });
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

  getUserGameReviews(search: string, page: number): Observable<PaginatedResponse<UserReviewCard>> {
    const params: Record<string, string | number> = { page };
    if (search) params['search'] = search;
    return this.http.get<PaginatedResponse<UserReviewCard>>(`${this.base}/user/reviews/games`, { params });
  }

  getUserCardData(): Observable<UserCardData> {
    return this.http.get<UserCardData>(`${this.base}/user/profile/card`);
  }

  getPublicCard(userId: number): Observable<UserCardData> {
    return this.http.get<UserCardData>(`${this.base}/public/card/${userId}`);
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.base}/user/profile`);
  }

  updateProfile(data: Partial<{ name: string; avatar: string | null; social_links: SocialLinks; card_big_bg: string | null; card_mid_bg: string | null; card_mini_bg: string | null }>): Observable<void> {
    return this.http.put<void>(`${this.base}/user/profile`, data);
  }

  getConsents(): Observable<UserConsents> {
    return this.http.get<UserConsents>(`${this.base}/user/consents`);
  }

  updateConsents(data: Partial<UserConsents>): Observable<void> {
    return this.http.patch<void>(`${this.base}/user/consents`, data);
  }

  getFollowers(): Observable<FollowersResponse> {
    return this.http.get<FollowersResponse>(`${this.base}/user/followers`);
  }

  getBadgeProgress(): Observable<BadgesProgress> {
    return this.http.get<BadgesProgress>(`${this.base}/user/badges`);
  }

  claimBadge(slug: string): Observable<void> {
    return this.http.post<void>(`${this.base}/user/badges/${slug}/claim`, {});
  }

  removeBadge(slug: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/user/badges/${slug}`);
  }

  getActiveSurveys(): Observable<ActiveSurvey[]> {
    return this.http.get<ActiveSurvey[]>(`${this.base}/surveys/active`);
  }

  respondSurvey(surveyId: number, optionId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/surveys/${surveyId}/respond`, { option_id: optionId });
  }

  getActiveAnnouncements(): Observable<ActiveAnnouncement[]> {
    return this.http.get<ActiveAnnouncement[]>(`${this.base}/announcements/active`);
  }

  getVerifyRequest(): Observable<VerificationRequest | null> {
    return this.http.get<VerificationRequest | null>(`${this.base}/user/verify-request`);
  }

  submitVerifyRequest(data: Partial<VerificationRequest>): Observable<VerificationRequest> {
    return this.http.post<VerificationRequest>(`${this.base}/user/verify-request`, data);
  }

  followUser(userId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/user/follow/${userId}`, {});
  }

  unfollowUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/user/follow/${userId}`);
  }
}
