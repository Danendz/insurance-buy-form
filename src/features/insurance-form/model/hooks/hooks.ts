import type { WithSlice } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { insuranceFormSlice } from '../slice';

export const useFormSelector = useSelector.withTypes<WithSlice<typeof insuranceFormSlice>>();
