/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Register a new user
     * Create a new user account and receive an authentication token
     * @returns any User registered successfully
     * @throws ApiError
     */
    public static e4E3Cb7B46126F4696379D3C7Eeb4Ad({
        requestBody,
    }: {
        /**
         * User registration data
         */
        requestBody: {
            /**
             * User's full name
             */
            name: string;
            /**
             * User's email address
             */
            email: string;
            /**
             * User's password (min 8 characters)
             */
            password: string;
            /**
             * Password confirmation
             */
            password_confirmation: string;
        },
    }): CancelablePromise<{
        user?: {
            id?: number;
            name?: string;
            email?: string;
            created_at?: string;
            updated_at?: string;
        };
        token?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation error`,
            },
        });
    }
    /**
     * Login user
     * Authenticate user and receive an authentication token
     * @returns any Login successful
     * @throws ApiError
     */
    public static b2625838E3C57E017987F73598Fda({
        requestBody,
    }: {
        /**
         * User credentials
         */
        requestBody: {
            /**
             * User's email address
             */
            email: string;
            /**
             * User's password
             */
            password: string;
        },
    }): CancelablePromise<{
        user?: {
            id?: number;
            name?: string;
            email?: string;
            created_at?: string;
            updated_at?: string;
        };
        token?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Invalid credentials`,
            },
        });
    }
    /**
     * Logout user
     * Revoke the current user's authentication token
     * @returns any Logout successful
     * @throws ApiError
     */
    public static ad65Cbbd4E9F201619Eae184A5961A98(): CancelablePromise<{
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/logout',
            errors: {
                401: `Unauthenticated`,
            },
        });
    }
    /**
     * Get authenticated user
     * Retrieve the currently authenticated user's information
     * @returns any User information retrieved successfully
     * @throws ApiError
     */
    public static feff40Ba10E43187792Cad3132C1(): CancelablePromise<{
        user?: {
            id?: number;
            name?: string;
            email?: string;
            created_at?: string;
            updated_at?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/me',
            errors: {
                401: `Unauthenticated`,
            },
        });
    }
}
