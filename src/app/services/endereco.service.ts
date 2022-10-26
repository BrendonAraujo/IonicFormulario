import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Endereco } from '../models/endereco';

@Injectable({
  providedIn: 'root'
})
export class EnderecoService {

  private urlConsultaCep = "https://viacep.com.br/ws/CEP/json/"

  constructor(private http: HttpClient) { }

  obterEndereco(cep){
    let urlComCep = this.urlConsultaCep.replace("CEP",cep);
    return this.http.get<Endereco>(urlComCep);
  }
}
