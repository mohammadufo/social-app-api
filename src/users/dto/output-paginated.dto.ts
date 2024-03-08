import { Paginate } from 'src/shared/classes/paginate';
import { User } from '../user.entity';
import { OutputUserDto } from './output-user.dto';

export class OutPutUserPaginated extends Paginate<OutputUserDto> {}
