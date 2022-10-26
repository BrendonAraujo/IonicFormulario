import { EnderecoService } from './../services/endereco.service';
import { Component, OnInit, NgModule } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Endereco } from '../models/endereco';
import { startWith, pairwise } from 'rxjs/operators';
import { IonRadio } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  public formulario : FormGroup;

  public generos = [
    "Masculino",
    "Feminino",
    "Não Informado",
    "Informar outro"
  ]
  
  //#region Validações por Campo
  private validacoesNome = [
    Validators.required,
    Validators.minLength(3),
  ];

  private validacoesSobrenome = [
    Validators.required,
    Validators.minLength(3)
  ];

  private validacoesCPF = [
    Validators.required,
    validaCPF()
  ];

  private validacoesCEP = [
    validarCep()
  ]

  //FIXME: Retirar validação de Required
  private validacoesGenero = [
    Validators.required
  ];
  //#endregion

  constructor(private formBuilder: FormBuilder, public enderecoService:EnderecoService) { 
    this.formulario = formBuilder.group({
      nome: ['',Validators.compose(this.validacoesNome)],
      sobrenome: ['',Validators.compose(this.validacoesSobrenome)],
      cpf: ['',Validators.compose(this.validacoesCPF)],
      generos: this.formBuilder.array(this.generos),
      CEP: ['', Validators.compose(this.validacoesCEP)],
      logradouro: [''],
      complemento: [''],
      bairro: [''],
      localidade: [''],
      uf: ['']
    });
  }

  async ngOnInit() {
    let dado = {
      nome: "",
      sobrenome: "",
      cpf: "00000000000",
      generos: "",
      CEP: "00000000",
      logradouro: "",
      complemento: "",
      bairro: "",
      localidade: "",
      uf: ""
    };

    this.formulario.patchValue(dado, {emitEvent:true});
    this.formulario.get('generos')
    .valueChanges
    .pipe(startWith(null),pairwise())
    .subscribe(([ anterior, atual]: [any, any]) => {
      console.log(anterior.value, atual.value);
    })
  }
  enviar() {
    console.log(this.formulario.value);
    if (!this.formulario.valid) {
        this.formulario.markAllAsTouched();
    }
  }

  selecionaGenero(i) {
    let radio : IonRadio
    radio = this.getPiecesArray.getRawValue()[i];
    let a = this.getPiecesArray.controls[i]
    console.log(a);
  }

  get getPiecesArray() {
    return (<FormArray>this.formulario.get('generos'));
  }

  onBlur(value){
    if(value != "" && value != "00000000"){
      let valueFormated = value.replace(/\./g,"").replace("-","")
      this.obterEndereco(valueFormated); 
    }
  }
  async obterEndereco(cep){
    let enderecoDoCep : Endereco;
    await this.enderecoService.obterEndereco(cep).subscribe(res => {
      enderecoDoCep = res;
      let dado = {
        nome: this.formulario.get("nome").value,
        sobrenome: this.formulario.get("sobrenome").value,
        cpf: this.formulario.get("cpf").value,
        generos: this.formulario.get("generos").value,
        CEP: enderecoDoCep.cep,
        logradouro: enderecoDoCep.logradouro,
        complemento: enderecoDoCep.complemento,
        bairro: enderecoDoCep.bairro,
        localidade: enderecoDoCep.localidade,
        uf: enderecoDoCep.uf
      }
      this.formulario.patchValue(dado,{emitEvent:true});
    });
  }
}

export function validarCep(): ValidatorFn{
  return (control: AbstractControl): ValidationErrors | null => {
    if(control.value != ""){
      let cep = control.value.replace(/\./g,"").replace("-","");
      if(cep.length != 8){
        return {cpfInvalido: true};
      }
    }
  }
}

export function validaCPF(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if(control.value != ""){
      let cpf = control.value.replace(/\./g,"").replace("-","");
  
      let somaPrimeiroDigitoVerificador = 0;
      let somaSomaSegundoDigitoVerificador = 0;
  
      let contadorPosicaoDigitoVerificador = 10;
      let contadorPosicaoSegundoDigitoVerificador = 11;
      
      if (cpf == "00000000"){
        return {cpfIncorreto: true};
      }else if( cpf.length == 11 ){
        let arrayCPF = cpf.split("");  
        arrayCPF.forEach(element => {
          if(contadorPosicaoDigitoVerificador > 1){
            somaPrimeiroDigitoVerificador += ( element * contadorPosicaoDigitoVerificador );
            contadorPosicaoDigitoVerificador--;
          }
          if(contadorPosicaoSegundoDigitoVerificador > 2){
            somaSomaSegundoDigitoVerificador += ( element * contadorPosicaoSegundoDigitoVerificador );
            contadorPosicaoSegundoDigitoVerificador--;
          }
        });
        
        let primeiroIdentificador = 11 - ( somaPrimeiroDigitoVerificador % 11);
  
        somaSomaSegundoDigitoVerificador += ( 2 * primeiroIdentificador);
        let segundoIdentificador = 11 - ( somaSomaSegundoDigitoVerificador % 11 ); 
        
        if(arrayCPF[9] != primeiroIdentificador || arrayCPF[10] != segundoIdentificador){
          return {cpfIncorreto : true};
        }
  
      }else{
        return {cpfImcompleto: true};
      }
    }
  };
}