/**
 * @file advancedResults.ts
 * @description Middleware para resultados avanzados con paginación, filtrado y ordenamiento
 * @module Middleware/AdvancedResults
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este middleware proporciona:
 * - Paginación automática de resultados
 * - Filtrado avanzado por múltiples campos
 * - Ordenamiento personalizable
 * - Selección de campos específicos
 * - Búsqueda con operadores de comparación
 * - Población de referencias de Mongoose
 * - Metadatos de paginación completos
 */

import { Request, Response, NextFunction } from 'express';
import { Model, Document } from 'mongoose';

interface AdvancedResultsResponse extends Response {
  advancedResults?: {
    success: boolean;
    count: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      next?: {
        page: number;
        limit: number;
      };
      prev?: {
        page: number;
        limit: number;
      };
    };
    data: any[];
  };
}

interface QueryRequest extends Request {
  query: {
    select?: string;
    sort?: string;
    page?: string;
    limit?: string;
    [key: string]: any;
  };
}

/**
 * Middleware de resultados avanzados para consultas de Mongoose
 * 
 * @function advancedResults
 * @param {Model<any>} model - Modelo de Mongoose para realizar la consulta
 * @param {string|object} populate - Campo(s) a poblar en la consulta (opcional)
 * @returns {Function} Middleware de Express que procesa la consulta
 * 
 * @description
 * Características principales:
 * - Filtrado automático por parámetros de query
 * - Soporte para operadores de comparación ($gt, $gte, $lt, $lte, $in)
 * - Paginación con metadatos completos
 * - Ordenamiento flexible con alias predefinidos
 * - Selección de campos específicos
 * - Población automática de referencias
 * 
 * @example
 * ```typescript
 * // En una ruta
 * router.get('/items', advancedResults(Item, 'user'), getItems);
 * 
 * // Query examples:
 * // GET /items?page=2&limit=10&sort=recent
 * // GET /items?category=electronics&condition=new
 * // GET /items?price[gte]=100&price[lte]=500
 * ```
 */
const advancedResults = (model: Model<any>, populate?: string | object) => async (
  req: QueryRequest,
  res: AdvancedResultsResponse,
  next: NextFunction
) => {
  let query;

  // Copia req.query
  const reqQuery = { ...req.query };

  // Campos que se excluyen
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Bucle por todo removeFields y borrado de reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Crea el string para la query
  let queryStr = JSON.stringify(reqQuery);

  // Operadores ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Encontrar el recurso
  query = model.find(JSON.parse(queryStr));

  // Seleccionar campos relevantes
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Ordenar usando sort
  if (req.query.sort) {
    let sortBy = req.query.sort;
    
    // Controlamos que tipo de ordenación se va a llevar a cabo
    if (sortBy === 'recent') {
      sortBy = '-createdAt';
    } else if (sortBy === 'oldest') {
      sortBy = 'createdAt';
    } else if (sortBy === 'title_asc') {
      sortBy = 'title';
    } else if (sortBy === 'title_desc') {
      sortBy = '-title';
    }
    
    // Función para combinar varios tipo s de ordenación
    sortBy = sortBy.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Paginación de los resultados 
  const page = parseInt(req.query.page || '1', 10) || 1;
  const limit = parseInt(req.query.limit || '25', 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate as any);
  }

  // Executing query
  const results = await query;

  // Pagination result
  const pagination: any = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  next();
};

export default advancedResults;