<a name="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/jakebottrall/tmsw">
  </a>

<h3 align="center">tmsw</h3>

  <p align="center">
    tRPC integration for MSW.
    <br />
    <a href="https://github.com/jakebottrall/tmsw"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/jakebottrall/tmsw/issues">Report Bug</a>
    ·
    <a href="https://github.com/jakebottrall/tmsw/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#usage">Usage</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

tRPC integration for MSW. Inspired & built on [msw-trpc](https://github.com/maloguertin/msw-trpc). A fantastic package, all `tmsw` does is add support for `TRPCError`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### Installation

```sh
npm i tmsw
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

### Usage

Use `createTMSW` & your apps `AppRouter` to build typesafe msw handlers, like so:

```ts
import { setupServer } from "msw/node";
import { createTMSW } from "tmsw";

const tmsw = createTMSW<AppRouter>();

const server = setupServer(
  tmsw.getManyCountries.query((req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.data([{ name: "Tanzania", continent: "Africa" }])
    );
  }),
  tmsw.addOneCountry.mutation((req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.data({ name: "Tanzania", continent: "Africa" })
    );
  }),
  tmsw.nested.getManyCities.query((req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.data([{ name: "Dodoma", country: "Tanzania" }])
    );
  }),
  tmsw.nested.addOneCity.mutation((req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.data({ name: "Dodoma", country: "Tanzania" })
    );
  })
);
```

`tmsw` also supports `TRPCError`. Simply throw them like you would in a procedure:

```ts
server.use(
  tmsw.getManyCountries.query(() => {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Oops. Something went wrong",
    });
  })
);
```

### Config

`createTRPCMsw` accepts a 2nd argument:

```typescript
interface CreateTMSWConfig {
  basePath?: string;
  transformer?: CombinedDataTransformer;
}
```

| property    | default            | details                                                                                     |
| ----------- | ------------------ | ------------------------------------------------------------------------------------------- |
| basePath    | 'trpc'             | Defines a basepath to match all handlers against                                            |
| transformer | defaultTransformer | Will transform your output data with `transformer.output.serialize` when calling `ctx.data` |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Jake Bottrall - [@jakebottrall](https://twitter.com/jakebottrall)

Project Link: [https://github.com/jakebottrall/tmsw](https://github.com/jakebottrall/tmsw)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

Inspired & built on [msw-trpc](https://github.com/maloguertin/msw-trpc).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/jakebottrall/tmsw.svg?style=for-the-badge
[contributors-url]: https://github.com/jakebottrall/tmsw/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jakebottrall/tmsw.svg?style=for-the-badge
[forks-url]: https://github.com/jakebottrall/tmsw/network/members
[stars-shield]: https://img.shields.io/github/stars/jakebottrall/tmsw.svg?style=for-the-badge
[stars-url]: https://github.com/jakebottrall/tmsw/stargazers
[issues-shield]: https://img.shields.io/github/issues/jakebottrall/tmsw.svg?style=for-the-badge
[issues-url]: https://github.com/jakebottrall/tmsw/issues
[license-shield]: https://img.shields.io/github/license/jakebottrall/tmsw.svg?style=for-the-badge
[license-url]: https://github.com/jakebottrall/tmsw/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/jakebottrall
