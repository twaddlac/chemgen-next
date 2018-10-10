import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SearchFormExpScreenComponent} from './search-form-exp-screen.component';
import {FormsModule} from '@angular/forms';
import {ExpScreenApi, ExpScreenUploadWorkflowApi, SDKModels} from '../../../types/sdk/services/custom';
import {ExpScreenResultSet, ExpScreenUploadWorkflowResultSet, LoopBackFilter} from '../../../types/sdk/models';
import {HttpClient, HttpHandler} from '@angular/common/http';
import {SocketConnection} from '../../../types/sdk/sockets/socket.connections';
import {SocketDriver} from '../../../types/sdk/sockets/socket.driver';
import {ErrorHandler, LoopBackAuth} from '../../../types/sdk/services/core';
import {InternalStorage} from '../../../types/sdk';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/internal/observable/of';
import {SearchFormExpScreenFormResults} from "./search-form-exp-screen.component";

describe('SearchFormExpScreenComponent', () => {
  let component: SearchFormExpScreenComponent;
  let fixture: ComponentFixture<SearchFormExpScreenComponent>;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [SearchFormExpScreenComponent],
      providers: [ExpScreenApi, ExpScreenUploadWorkflowApi, HttpClient,
        HttpHandler, SocketConnection, SocketDriver, SDKModels, LoopBackAuth, InternalStorage, ErrorHandler],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormExpScreenComponent);
    component = fixture.componentInstance;
    component.formResults = new SearchFormExpScreenFormResults();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

