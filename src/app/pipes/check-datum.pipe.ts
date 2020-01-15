import { Pipe, PipeTransform } from '@angular/core';
import memo from 'memo-decorator'

@Pipe({
  name: 'checkDatum'
})
export class CheckDatumPipe implements PipeTransform {

  @memo()
  transform(date: string): string {
    var now=new Date()
    var day=now.getDate()
    var zero=""
    var m_zero=""
    if (day.toString().length<2) {
      zero="0";
    }
    var month=now.getMonth()+1
    if (month.toString().length<2) {
      m_zero="0";
    }
    var year=now.getFullYear()
    var final_now=year+"-"+m_zero+month+"-"+zero+day
    if (date==final_now){
      return 'HEUTE'
    }
    else{
      var day=now.getDate()+1;
      if (day.toString().length<2) {
        zero="0"
      } else {
        zero=""
      }
      if (month.toString().length<2) {
        m_zero="0"
      } else {
        m_zero=""
      }
      var final_now=year+"-"+m_zero+month+"-"+zero+day
      if (date==final_now){
        return 'MORGEN'
      }
      else{
        var weekday_name
        var event_date=new Date(date)
        var month = event_date.getMonth()+1
        if (month.toString().length < 2) {
          m_zero = '0'
        } else {
          m_zero = ''
        }
        if (event_date.getDay()==1) weekday_name="Mo. "
        if (event_date.getDay()==2) weekday_name="Di. "
        if (event_date.getDay()==3) weekday_name="Mi. "
        if (event_date.getDay()==4) weekday_name="Do. "
        if (event_date.getDay()==5) weekday_name="Fr. "
        if (event_date.getDay()==6) weekday_name="Sa. "
        if (event_date.getDay()==0) weekday_name="So. "
        if (event_date.getDate().toString().length<2) zero="0";
        else zero=""
        return weekday_name+zero+event_date.getDate()+"."+m_zero+month+'.'
      }
    }
  }

}
