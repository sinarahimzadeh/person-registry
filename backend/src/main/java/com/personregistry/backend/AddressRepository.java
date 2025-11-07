package com.personregistry.backend;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Long> {
    Address findByPersonTaxCode(String personTaxCode);
    void deleteByPersonTaxCode(String personTaxCode);
}
