import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { NgToastService } from 'ng-angular-popup';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../models/user.model';

@Component({
  selector: 'app-create-registration',
  templateUrl: './create-registration.component.html',
  styleUrls: ['./create-registration.component.scss']
})
export class CreateRegistrationComponent implements OnInit{
  public packages: string[] = ["Tháng", "Quý", "Năm"];
  public genders: string[] = ["Nam", "Nữ"];
  public hobbies: string[] = [
    "Giảm mỡ thừa",
    "Tăng cơ",
    "Nâng cao thể lực",
    "Hệ thống tuần hoàn khỏe mạnh",
    "Cân đối",
    "Tăng chiều cao"
  ];

  public registerForm!: FormGroup;
  public userIdToUpdate!: number;
  public isUpdateActive: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute, private api: ApiService, private toastService: NgToastService) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      mobile: [''],
      weight: [''],
      height: [''],
      bmi: [''],
      bmiResult: [''],
      gender: [''],
      requireTrainer: [''],
      package: [''],
      important: [''],
      haveGymBefore: [''],
      enquiryDate: ['']
    });

    this.registerForm.controls['height'].valueChanges.subscribe(res => {
      this.calculateBmi(res);
    });

    this.activatedRoute.params.subscribe(val => {
      this.userIdToUpdate = val['id'];
      this.api.getRegisteredUserId(this.userIdToUpdate).subscribe(res => {
        this.isUpdateActive = true;
        this.fillFormToUpdate(res);
      })
    })
  }

  submit() {
    this.api.postRegistration(this.registerForm.value).subscribe(res => {
      this.toastService.success({detail: "Thành công", summary: "Đăng ký thành công", duration: 3000});
      this.registerForm.reset();
    })
  }

  update() {
    this.api.updateRegisteredUser(this.registerForm.value, this.userIdToUpdate).subscribe(res => {
      this.toastService.success({detail: "Thành công", summary: "Cập nhật thành công", duration: 3000});
      this.registerForm.reset();
      this.router.navigate(['list']);
    })
  }

  calculateBmi(heightVal: number) {
    const weight = this.registerForm.value.weight;
    const height = heightVal;
    const bmi = weight / (height * height);
    this.registerForm.controls['bmi'].patchValue(bmi);

    switch(true) {
      case bmi < 18.5:
        this.registerForm.controls['bmiResult'].patchValue("Gầy");
        break;

      case (bmi >= 18.5 && bmi < 25):
        this.registerForm.controls['bmiResult'].patchValue("Bình thường");
        break;

      case (bmi > 25 && bmi < 30):
        this.registerForm.controls['bmiResult'].patchValue("Thừa cân");
        break;

      default:
        this.registerForm.controls['bmiResult'].patchValue("Gầy");
        break;
    }
  }

  fillFormToUpdate(user: User) {
    this.registerForm.setValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      weight: user.weight,
      height: user.height,
      bmi: user.bmi,
      bmiResult: user.bmiResult,
      gender: user.gender,
      requireTrainer: user.requireTrainer,
      package: user.package,
      important: user.important,
      haveGymBefore: user.haveGymBefore,
      enquiryDate: user.enquiryDate
    })
  }
}
