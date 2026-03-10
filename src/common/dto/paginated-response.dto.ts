import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 42 })
  totalItems: number;

  @ApiProperty({ example: 5 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasPreviousPage: boolean;

  @ApiProperty({ example: false })
  hasNextPage: boolean;
}

export class PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;

  constructor(data: T[], totalItems: number, page: number, limit: number) {
    const totalPages = Math.ceil(totalItems / limit);

    this.data = data;
    this.meta = {
      page,
      limit,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
  }
}
