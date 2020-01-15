import { Pipe, PipeTransform, Host } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AufgebenTermineComponent } from '@components/aufgeben-termine/aufgeben-termine.component';
import { debounceTime, combineLatest, map, filter } from 'rxjs/operators';

@Pipe({
    name: 'orteFilter'
})
export class BasicPipe implements PipeTransform {

    constructor(
        @Host() private _aufgeben: AufgebenTermineComponent
    ) { }

    transform(items: BehaviorSubject<any[]>) {
        return items.pipe(
            debounceTime(100),
            combineLatest(this._aufgeben.orte_search),
            map(([items, filter]: [any[], string]) => {
                if (!items || !filter) return items
                const fieldsToSearch = ['adressname', 'region']
                return filter.length >= 3 ? items.filter(item => {
                    const stringToSearch = fieldsToSearch.reduce((a, b) => a += item[b], '')
                    return stringToSearch.toLowerCase().includes(filter.toLowerCase())
                }) : items
            })
        )
    }
}