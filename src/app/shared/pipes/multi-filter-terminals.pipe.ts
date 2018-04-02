import { Pipe, PipeTransform } from '@angular/core';
import { isNumeric } from './isNumeric';

@Pipe({
  name: 'multiFilterTerminals'
})
export class MultiFilterTerminalsPipe implements PipeTransform {

  transform(items: any[], multifilter: any): any {
    if (!items || !multifilter) {
      return items;
    }
    const regId = new RegExp(multifilter.Id, 'i');
    const regName = new RegExp(multifilter.Name, 'i');
    const regAddress = new RegExp(multifilter.Address, 'i');
    return items.filter(item => {
      if (!regId.test(item.Id)) {
        return false;
      }
      if (!regName.test(item.Name)) {
        return false;
      }
      if (!regAddress.test(item.Address)) {
        return false;
      }
      if (multifilter.Connection !== null && multifilter.Connection !== item.Connection) {
        return false;
      }
      if (multifilter.Service !== null && multifilter.Service !== item.Service) {
        return false;
      }
      if (multifilter.Failure !== null && multifilter.Failure !== item.Failure) {
        return false;
      }
      if (item.SalesSum < multifilter.SalesSumFrom && isNumeric(multifilter.SalesSumFrom)) {
        return false;
      }
      if (item.SalesSum > multifilter.SalesSumTo && isNumeric(multifilter.SalesSumTo)) {
        return false;
      }
      if (item.CollectSum < multifilter.CollectSumFrom && isNumeric(multifilter.CollectSumFrom)) {
        return false;
      }
      if (item.CollectSum > multifilter.CollectSumTo && isNumeric(multifilter.CollectSumTo)) {
        return false;
      }
      return true;
    });
  }

}
