/**
 * @file async.ts
 * @description Middleware para manejo automático de errores en funciones asíncronas
 * @module Middleware/AsyncHandler
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este middleware elimina la necesidad de usar try-catch en cada controlador
 * asíncrono, capturando automáticamente cualquier error y pasándolo al
 * middleware de manejo de errores.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper para funciones asíncronas que maneja errores automáticamente
 * 
 * @function asyncHandler
 * @param {Function} fn - Función asíncrona del controlador
 * @returns {Function} Middleware de Express que captura errores automáticamente
 * 
 * @description
 * Envuelve controladores asíncronos para capturar errores automáticamente
 * y pasarlos al middleware de manejo de errores sin necesidad de try-catch
 * 
 * @example
 * ```typescript
 * // Sin asyncHandler (requiere try-catch manual)
 * export const getUsers = async (req, res, next) => {
 *   try {
 *     const users = await User.find();
 *     res.json(users);
 *   } catch (error) {
 *     next(error);
 *   }
 * };
 * 
 * // Con asyncHandler (manejo automático)
 * export const getUsers = asyncHandler(async (req, res, next) => {
 *   const users = await User.find();
 *   res.json(users);
 * });
 * ```
 */
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;