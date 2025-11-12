package com.personregistry.service;

import com.personregistry.model.dto.AddressDto;
import com.personregistry.model.dto.PersonDto;
import com.personregistry.model.persistence.Address;
import com.personregistry.model.persistence.Person;
import com.personregistry.repository.AddressRepository;
import com.personregistry.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PersonService {

    private final PersonRepository personRepository;
    private final AddressRepository addressRepository;

    @Transactional
    public void create(PersonDto dto) {
        String cf = dto.getTaxCode().toUpperCase();
        if (personRepository.existsByTaxCode(cf)) {
            throw new IllegalArgumentException("Tax code already exists");
        }
        Address address = findOrCreate(dto.getAddress());
        Person p = new Person();
        p.setTaxCode(cf);
        p.setName(dto.getName());
        p.setSurname(dto.getSurname());
        p.setAddress(address);
        personRepository.save(p);
    }

    @Transactional(readOnly = true)
    public PersonDto get(String taxCode) {
        String cf = taxCode.toUpperCase();
        Person p = personRepository.findByTaxCode(cf);
        if (p == null) throw new RuntimeException("Not found");
        return toDto(p);
    }

    @Transactional(readOnly = true)
    public List<PersonDto> list() {
        return personRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void update(String taxCode, PersonDto dto) {
        String cf = taxCode.toUpperCase();
        Person p = personRepository.findByTaxCode(cf);
        if (p == null) throw new RuntimeException("Not found");
        p.setName(dto.getName());
        p.setSurname(dto.getSurname());
        p.setAddress(findOrCreate(dto.getAddress()));
        personRepository.save(p);
    }

    @Transactional
    public void delete(String taxCode) {
        String cf = taxCode.toUpperCase();
        Person p = personRepository.findByTaxCode(cf);
        if (p != null) {
            personRepository.delete(p);
        }
    }

    private Address findOrCreate(AddressDto a) {
        String province = a.getProvince() == null ? null : a.getProvince().toUpperCase();
        return addressRepository
                .findByStreetAndStreetNoAndCityAndProvinceAndCountry(
                        a.getStreet(), a.getStreetNo(), a.getCity(), province, a.getCountry())
                .orElseGet(() -> {
                    Address e = new Address();
                    e.setStreet(a.getStreet());
                    e.setStreetNo(a.getStreetNo());
                    e.setCity(a.getCity());
                    e.setProvince(province);
                    e.setCountry(a.getCountry());
                    return addressRepository.save(e);
                });
    }

    private PersonDto toDto(Person p) {
        PersonDto dto = new PersonDto();
        dto.setTaxCode(p.getTaxCode());
        dto.setName(p.getName());
        dto.setSurname(p.getSurname());

        Address a = p.getAddress();
        if (a != null) {
            AddressDto ad = new AddressDto();
            ad.setStreet(a.getStreet());
            ad.setStreetNo(a.getStreetNo());
            ad.setCity(a.getCity());
            ad.setProvince(a.getProvince());
            ad.setCountry(a.getCountry());
            dto.setAddress(ad);
        }

        return dto;
    }
}
