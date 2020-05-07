import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, EventEmitter, forwardRef, Output, ViewChild, Input, OnInit, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormGroup, FormControl } from '@angular/forms';
import { AbstractControlValueAccessor } from '../util/abstract-value-accessor';
import { fromEvent, Subscription } from 'rxjs';
import { filter, debounceTime, distinctUntilKeyChanged, distinctUntilChanged, map } from 'rxjs/operators';
import { DataService } from 'src/app/model/services/shared/data.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'mat-search-bar',
  templateUrl: './mat-search-bar.component.html',
  styleUrls: ['./mat-search-bar.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('true', style({ width: '*' })),
      state('false', style({ width: '0' })),
      transition('true => false', animate('200ms ease-in')),
      transition('false => true', animate('200ms ease-out'))
    ]),
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MatSearchBarComponent),
      multi: true
    }
  ]
})
export class MatSearchBarComponent extends AbstractControlValueAccessor<string> implements AfterViewInit {
  constructor(private dataService: DataService) {
    super();

  }
  @Input() public searchText: string = "Xyzeki İş Arama";
  @Input() public isDarkMode: boolean = false

  private subscription: Subscription;
  ngAfterViewInit(): void {
    const textSignals$ = fromEvent<any>(this.inputElement.nativeElement, 'input').
      pipe(debounceTime(750), distinctUntilChanged(), map(event => event.target.value), map(val => val ? val : undefined))
    this.subscription = textSignals$.subscribe((searchValue: string) => {
      this.dataService.newDeepSearchEvent.next(searchValue);
      
      if (this.isContainerSearch) {
        this.dataService.newContainerSearchEvent.next(searchValue);
      }
      if (this.isContainerBlobSearch) {
        this.dataService.newContainerBlobSearchEvent.next(searchValue);
      }

    }
    );
  }
  @Input() isContainerSearch: boolean = false
  @Input() isContainerBlobSearch: boolean = false

  @ViewChild('input') inputElement: ElementRef
  @Input() formControl: FormControl;

  @Output() onBlur = new EventEmitter<string>();
  @Output() onClose = new EventEmitter<void>();
  @Output() onEnter = new EventEmitter<string>();
  @Output() onFocus = new EventEmitter<string>();
  @Output() public onOpen = new EventEmitter<void>();

  searchVisible = false;

  public close(): void {
    this.searchVisible = false;
    this.value = '';
    this.updateChanges();
    this.onClose.emit();
    let val = this.inputElement.nativeElement.value;
    // if (val != ) {
    this.dataService.newDeepSearchEvent.next(undefined); // Show all
    if (this.isContainerSearch) {
      this.dataService.newContainerSearchEvent.next(undefined);
    }
    if (this.isContainerBlobSearch) {
      this.dataService.newContainerBlobSearchEvent.next(undefined);
    }
    // }

  }

  public open(): void {
    this.searchVisible = true;
    this.inputElement.nativeElement.focus();
    this.onOpen.emit();
  }

  onBlurring(searchValue: string) {
    if (!searchValue) {
      this.searchVisible = false;
    }
    this.onBlur.emit(searchValue);
  }

  onEnterring(searchValue: string) {
    this.onEnter.emit(searchValue);

  }

  onFocussing(searchValue: string) {
    this.onFocus.emit(searchValue);
  }


}
