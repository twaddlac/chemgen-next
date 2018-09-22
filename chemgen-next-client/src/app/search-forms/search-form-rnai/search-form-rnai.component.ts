import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-search-form-rnai',
  templateUrl: './search-form-rnai.component.html',
  styleUrls: ['./search-form-rnai.component.css']
})
export class SearchFormRnaiComponent implements OnInit {

  @Input('formResults') formResults: SearchFormRnaiFormResults;
  rnais = '';

  constructor() {
  }

  ngOnInit() {
  }

  updateRnaisList() {
    console.log('should be updating!');
    this.formResults.rnaisList = [];
    this.rnais.split('\n').map((split1) => {
      split1.split(/\s+/).map((split2) => {
        if (split2) {
          this.formResults.rnaisList.push(split2.trim());
        }
      });
    });
    console.log(JSON.stringify(this.rnais));
    console.log(JSON.stringify(this.formResults.rnaisList));
  }

}

export class SearchFormRnaiFormResults {
  rnaisList: Array<string> = [];
}
