package com.bookstore.config;

import com.bookstore.model.*;
import com.bookstore.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        log.info("Seeding initial mock data for Book Platform...");

        // 1. Seed Categories
        Category fiction = categoryRepository.save(Category.builder()
                .name("Fiction & Literature")
                .description("Novels, classics, and contemporary fiction")
                .slug("fiction")
                .build());

        Category tech = categoryRepository.save(Category.builder()
                .name("Computers & Technology")
                .description("Programming, architecture, AI and Cloud")
                .slug("technology")
                .build());

        Category science = categoryRepository.save(Category.builder()
                .name("Science & Mathematics")
                .description("Physics, astronomy, and biology")
                .slug("science")
                .build());

        // 2. Seed Brands / Publishers
        Brand penguin = brandRepository.save(Brand.builder()
                .name("Penguin Random House")
                .type(BrandType.publisher)
                .build());

        Brand oreilly = brandRepository.save(Brand.builder()
                .name("O'Reilly Media")
                .type(BrandType.publisher)
                .build());

        Brand harper = brandRepository.save(Brand.builder()
                .name("HarperCollins")
                .type(BrandType.publisher)
                .build());

        // 3. Seed Products
        Product gatsby = Product.builder()
                .title("The Great Gatsby")
                .author("F. Scott Fitzgerald")
                .isbn("978-0743273565")
                .description("The classic story of Jay Gatsby and the Jazz Age.")
                .pageCount(180)
                .price(BigDecimal.valueOf(14.99))
                .currency("USD")
                .coverImageUrl("https://images.example.com/books/gatsby.jpg")
                .inStock(true)
                .estimatedDeliveryDays(3)
                .category(fiction)
                .brand(penguin)
                .build();

        Product cleanCode = Product.builder()
                .title("Clean Code: A Handbook of Agile Software Craftsmanship")
                .author("Robert C. Martin")
                .isbn("978-0132350884")
                .description("A must-read handbook for software craftsmanship.")
                .pageCount(464)
                .price(BigDecimal.valueOf(42.50))
                .currency("USD")
                .coverImageUrl("https://images.example.com/books/cleancode.jpg")
                .inStock(true)
                .estimatedDeliveryDays(2)
                .category(tech)
                .brand(oreilly)
                .build();

        Product pragmatic = Product.builder()
                .title("The Pragmatic Programmer")
                .author("David Thomas, Andrew Hunt")
                .isbn("978-0135957059")
                .description("Your journey to software mastery.")
                .pageCount(352)
                .price(BigDecimal.valueOf(49.99))
                .currency("USD")
                .coverImageUrl("https://images.example.com/books/pragmatic.jpg")
                .inStock(true)
                .estimatedDeliveryDays(2)
                .category(tech)
                .brand(oreilly)
                .build();

        gatsby = productRepository.save(gatsby);
        cleanCode = productRepository.save(cleanCode);
        pragmatic = productRepository.save(pragmatic);

        // Associate related products (use mutable ArrayList so Hibernate can manage the collection)
        cleanCode.setRelatedProducts(new ArrayList<>(List.of(pragmatic)));
        pragmatic.setRelatedProducts(new ArrayList<>(List.of(cleanCode)));
        productRepository.save(cleanCode);
        productRepository.save(pragmatic);

        // 4. Seed Demo User (use mutable HashSet for roles)
        User demoUser = User.builder()
                .email("demo@bookstore.com")
                .password(passwordEncoder.encode("Password123!"))
                .firstName("Alice")
                .lastName("Smith")
                .roles(new HashSet<>(Set.of(RoleType.ROLE_CUSTOMER)))
                .build();
        demoUser = userRepository.save(demoUser);

        // Seed Address
        Address address = Address.builder()
                .user(demoUser)
                .street("123 Market Street, Apt 4B")
                .city("San Francisco")
                .state("CA")
                .postalCode("94105")
                .country("USA")
                .isDefault(true)
                .build();
        addressRepository.save(address);

        // Seed Wallet with 500 Gift Points ($5.00) and $50 store balance
        Wallet wallet = Wallet.builder()
                .user(demoUser)
                .balance(BigDecimal.valueOf(50.00))
                .giftPoints(500)
                .build();
        walletRepository.save(wallet);

        log.info("Initial mock data successfully seeded. Demo login: demo@bookstore.com / Password123!");
    }
}
