import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({
    example: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      fullName: 'John Doe',
      email: 'john@example.com',
      role: 'member',
      isActive: true,
    },
  })
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    isActive: boolean;
  };

  @ApiProperty({ type: TokenResponseDto })
  tokens: TokenResponseDto;
}
