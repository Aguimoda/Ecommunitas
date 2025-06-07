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

const advancedResults = (model: Model<any>, populate?: string | object) => async (
  req: QueryRequest,
  res: AdvancedResultsResponse,
  next: NextFunction
) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = model.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    let sortBy = req.query.sort;
    
    // Handle special sort values
    if (sortBy === 'recent') {
      sortBy = '-createdAt';
    } else if (sortBy === 'oldest') {
      sortBy = 'createdAt';
    } else if (sortBy === 'title_asc') {
      sortBy = 'title';
    } else if (sortBy === 'title_desc') {
      sortBy = '-title';
    }
    
    // Handle multiple sort fields
    sortBy = sortBy.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
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