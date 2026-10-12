import { ApiProperty } from '@nestjs/swagger';

export class AppResponseDto<T> {
  @ApiProperty({ example: 0, description: 'Código de estado de la operación (0 = éxito)' })
  code: number;

  @ApiProperty({ example: 'Ok', description: 'Mensaje descriptivo del resultado' })
  message: string;

  @ApiProperty({ description: 'Datos devueltos por el endpoint' })
  data: T;
}
