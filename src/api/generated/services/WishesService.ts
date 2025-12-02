/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WishesService {
    /**
     * Create a new wish
     * Create a new wish (no authentication required)
     * @returns any Wish created successfully
     * @throws ApiError
     */
    public static b34792Ed549F54Dfa2F59564De9Dc1({
        requestBody,
    }: {
        /**
         * Wish data
         */
        requestBody: {
            /**
             * Name of person making the wish
             */
            name: string;
            /**
             * Wish title
             */
            title: string;
            /**
             * Detailed wish description
             */
            description: string;
            /**
             * Priority level (defaults to medium)
             */
            priority?: 'high' | 'medium' | 'low';
        },
    }): CancelablePromise<{
        message?: string;
        wish?: {
            id?: number;
            name?: string;
            title?: string;
            description?: string;
            priority?: string;
            status?: string;
            created_at?: string;
            updated_at?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/wishes',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation error`,
            },
        });
    }
    /**
     * Get a specific wish
     * Retrieve details of a specific wish (requires view_all_wishes permission - Santa and Elfs only)
     * @returns any Wish retrieved successfully
     * @throws ApiError
     */
    public static b6Da589694075Cac266F5566C933B34({
        id,
    }: {
        /**
         * Wish ID
         */
        id: number,
    }): CancelablePromise<{
        wish?: {
            id?: number;
            name?: string;
            title?: string;
            description?: string;
            priority?: string;
            status?: string;
            created_at?: string;
            updated_at?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/wishes/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Forbidden - Insufficient permissions`,
                404: `Wish not found`,
            },
        });
    }
    /**
     * Update a wish
     * Update a wish (only Santa and Elfs can update wishes)
     * @returns any Wish updated successfully
     * @throws ApiError
     */
    public static ccd65916Ccf41123Db5Abfcb5E781464({
        id,
        requestBody,
    }: {
        /**
         * Wish ID
         */
        id: number,
        /**
         * Wish update data
         */
        requestBody?: {
            /**
             * Wish title
             */
            title?: string;
            /**
             * Detailed wish description
             */
            description?: string;
            priority?: 'high' | 'medium' | 'low';
            status?: 'pending' | 'granted' | 'denied' | 'in_progress';
        },
    }): CancelablePromise<{
        wish?: Record<string, any>;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/wishes/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Forbidden - Insufficient permissions`,
                404: `Wish not found`,
            },
        });
    }
    /**
     * Delete a wish
     * Soft delete a wish (only Santa and Elfs can delete wishes)
     * @returns any Wish deleted successfully
     * @throws ApiError
     */
    public static c21A12342A5D18Eb57926Aa9343Ab2({
        id,
    }: {
        /**
         * Wish ID
         */
        id: number,
    }): CancelablePromise<{
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/wishes/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Forbidden - Insufficient permissions`,
                404: `Wish not found`,
            },
        });
    }
    /**
     * Get all wishes (paginated)
     * Retrieve all wishes with pagination (requires view_all_wishes permission - Santa and Elfs only)
     * @returns any All wishes retrieved successfully
     * @throws ApiError
     */
    public static b0B257Cfb7Acd37F9D0E4A643Ed456C({
        page = 1,
        perPage = 15,
    }: {
        /**
         * Page number
         */
        page?: number,
        /**
         * Items per page
         */
        perPage?: number,
    }): CancelablePromise<{
        current_page?: number;
        data?: Array<{
            id?: number;
            name?: string;
            title?: string;
            description?: string;
            priority?: string;
            status?: string;
            created_at?: string;
            updated_at?: string;
        }>;
        first_page_url?: string;
        from?: number;
        last_page?: number;
        last_page_url?: string;
        links?: Array<{
            url?: string | null;
            label?: string;
            active?: boolean;
        }>;
        next_page_url?: string | null;
        path?: string;
        per_page?: number;
        prev_page_url?: string | null;
        to?: number;
        total?: number;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/wishes/all',
            query: {
                'page': page,
                'per_page': perPage,
            },
            errors: {
                403: `Forbidden - Insufficient permissions`,
            },
        });
    }
}
