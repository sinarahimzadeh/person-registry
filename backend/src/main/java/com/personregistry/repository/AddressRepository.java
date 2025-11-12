package com.personregistry.repository;

import com.personregistry.model.persistence.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {
    Optional<Address> findByStreetAndStreetNoAndCityAndProvinceAndCountry(
            String street, String streetNo, String city, String province, String country);
}
